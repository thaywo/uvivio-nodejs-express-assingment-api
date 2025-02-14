import { Router } from "express";
import { body } from "express-validator";
import validateFormData from "../helpers/validate_form.js";
import DB from "../models/db.js";
import Groq from "groq-sdk";
import config from '.././config.js';

const router = Router();

const groq = new Groq({
  apiKey: config.groq.apiKey
});

/**
 * Route to list jobs records
 * @GET /jobs/index/{fieldname}/{fieldvalue}
 */
router.get(["/", "/index/:fieldname?/:fieldvalue?"], async (req, res) => {
  try {
    const query = {};
    let queryFilters = [];
    let where = {};
    let replacements = {};
    let fieldName = req.params.fieldname;
    let fieldValue = req.params.fieldvalue;

    if (fieldName) {
      queryFilters.push(DB.filterBy(fieldName, fieldValue));
    }
    let search = req.query.search;
    if (search) {
      let searchFields = DB.Jobs.searchFields();
      where[DB.op.or] = searchFields;
      replacements.search = `%${search}%`;
    }

    if (queryFilters.length) {
      where[DB.op.and] = queryFilters;
    }
    query.raw = true;
    query.where = where;
    query.replacements = replacements;
    query.order = DB.getOrderBy(req, "id", "desc");
    query.attributes = DB.Jobs.listFields();
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let result = await DB.Jobs.paginate(query, page, limit);
    return res.ok(result);
  } catch (err) {
    return res.serverError(err);
  }
});

/**
 * Route to view Jobs record
 * @GET /jobs/view/{recid}
 */
router.get("/view/:recid", async (req, res) => {
  try {
    const recid = req.params.recid || null;
    const query = {};
    const where = {};
    where["id"] = recid;
    query.raw = true;
    query.where = where;
    query.attributes = DB.Jobs.viewFields();
    let record = await DB.Jobs.findOne(query);
    if (!record) {
      return res.notFound();
    }
    return res.ok(record);
  } catch (err) {
    return res.serverError(err);
  }
});

/**
 * Route to insert Jobs record
 * @POST /jobs/add
 */
router.post(
  "/add/",
  [
    body("title").not().isEmpty(),
    body("description").not().isEmpty(),
    body("skills").not().isEmpty(),
  ],
  validateFormData,
  async function (req, res) {
    try {
      let modeldata = req.getValidFormData();
      
      if (typeof modeldata.skills === "string") {
        modeldata.skills = modeldata.skills.split(",").map((skill) => skill.trim());
      }

      // Save Jobs record
      let record = await DB.Jobs.create(modeldata);
      const recid = record["id"];

      return res.ok(record);
    } catch (err) {
      return res.serverError(err);
    }
  }
);

/**
 * Route to get  Jobs record for edit
 * @GET /jobs/edit/{recid}
 */
router.get("/edit/:recid", async (req, res) => {
  try {
    const recid = req.params.recid;
    const query = {};
    const where = {};
    where["id"] = recid;
    query.raw = true;
    query.where = where;
    query.attributes = DB.Jobs.editFields();
    let record = await DB.Jobs.findOne(query);
    if (!record) {
      return res.notFound();
    }
    return res.ok(record);
  } catch (err) {
    return res.serverError(err);
  }
});

/**
 * Route to update  Jobs record
 * @POST /jobs/edit/{recid}
 */
router.post(
  "/edit/:recid",
  [
    body("title").optional({ nullable: true }).not().isEmpty(),
    body("description").optional({ nullable: true }).not().isEmpty(),
    body("skills").optional({ nullable: true }).not().isEmpty(),
  ],
  validateFormData,
  async (req, res) => {
    try {
      const recid = req.params.recid;
      let modeldata = req.getValidFormData({ includeOptionals: true });
      const query = {};
      const where = {};
      where["id"] = recid;
      query.raw = true;
      query.where = where;
      query.attributes = DB.Jobs.editFields();
      let record = await DB.Jobs.findOne(query);
      if (!record) {
        return res.notFound();
      }
      await DB.Jobs.update(modeldata, { where: where });
      return res.ok(modeldata);
    } catch (err) {
      return res.serverError(err);
    }
  }
);

/**
 * Route to delete Jobs record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /jobs/delete/{recid}
 */
router.get("/delete/:recid", async (req, res) => {
  try {
    const recid = (req.params.recid || "").split(",");
    const query = {};
    const where = {};
    where["id"] = recid;
    query.raw = true;
    query.where = where;
    let records = await DB.Jobs.findAll(query);
    records.forEach(async (record) => {
      //perform action on each record before delete
    });
    await DB.Jobs.destroy(query);
    return res.ok(recid);
  } catch (err) {
    return res.serverError(err);
  }
});

/**
 * Route to get  reccommendation record for candidates
 * @GET /jobs/{job_id}/candidates
 */

router.get("/:job_id/candidates", async (req, res) => {
  try {
    const jobId = req.params.job_id;

    const job = await DB.Jobs.findOne({ where: { id: jobId } });
    if (!job) {
      return res.notFound({ error: "Job not found" });
    }

    const jobSkills = job.skills;

    const candidates = await DB.Candidates.findAll();

    const recommendedCandidates = candidates.filter((candidate) => {
      const candidateSkills = Array.isArray(candidate.skills)
        ? candidate.skills
        : candidate.skills.split(",").map((skill) => skill.trim());

      return candidateSkills.some((skill) => jobSkills.includes(skill));
    });

    const topCandidates = recommendedCandidates.slice(0, 3);
    const candidatesWithSummaries = await Promise.all(
      topCandidates.map(async (candidate) => {
        const prompt = `Generate a professional summary for a candidate named ${candidate.name} with skills in ${candidate.skills}.`;

        const response = await groq.chat.completions.create({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 100,
        });

        const summary = response.choices[0].message.content.trim();

        return {
          name: candidate.name,
          skills: candidate.skills,
          summary: summary,
        };
      })
    );

    return res.ok({
      message: `Based on the job posting, here are the top ${Math.min(
        3,
        candidatesWithSummaries.length
      )} candidates:`,
      candidates: candidatesWithSummaries,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.serverError(err);
  }
});
export default router;
