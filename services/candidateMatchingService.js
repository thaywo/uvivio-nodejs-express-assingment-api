class CandidateMatchingService {
  static calculateMatchScore(jobSkills, candidateSkills) {
    const matchingSkills = candidateSkills.filter(skill => 
      jobSkills.includes(skill.toLowerCase())
    );
    
    return {
      score: (matchingSkills.length / jobSkills.length) * 100,
      matchingSkills
    };
  }

  static normalizeSkills(skills) {
    if (Array.isArray(skills)) {
      return skills.map(skill => skill.toLowerCase().trim());
    }
    return skills.split(',').map(skill => skill.toLowerCase().trim());
  }
}

export default CandidateMatchingService;