export default {
	app: {
		name: "Uvivio_assingment",
		url: "http://localhost:8060",
		frontendUrl: "http://localhost:8050",
		secret: "ac3f4f18f5578d87a8d1960039973e26",
		language: "english",
		publicDir: "assets",
	},
	auth: {
		userTokenSecret: "19ea192A-1ax%W@220eeYY6Q!!0-b2b5f05954c2008eb3a3",
		apiTokenSecret: "54041be8$Xax%W!06dfe9B#Q-!07b6aabb5fc4614299ce28",
		jwtDuration: 30, //in minutes
		otpDuration: 5, //in minutes
	},
	database: {
		name:"assigment",
		type: "postgres",
		host: "localhost",
		username: "postgres",
		password: "@T25r",
		port: "5433",
		charset: "utf8",
		recordlimit: 10,
		ordertype: "DESC"
	},
	mail: {
		username:"",
		password: "",
		senderemail:"",
		sendername:"",
		host: "",
		secure: true,
		port: ""
	},
	upload: {
		tempDir: "uploads/temp/",
		importdata: {
			filenameType: "timestamp",
			extensions: "csv",
			limit: "10",
			maxFileSize: "3",
			returnFullpath: "false",
			filenamePrefix: "",
			uploadDir: "uploads/files/"
		},
		
	},
	s3: {
		secretAccessKey: "",
		accessKeyId: "",
		region: "us-west-2",
		bucket: "",
	},
  groq:{
    apiKey: "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",
  }
	
}
