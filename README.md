# New google speech api + microphone streaming

A very basic google speech api helper with microphone streaming to be used as base to others apps.


## Setup
  1. [Config Google cloud API](https://github.com/GoogleCloudPlatform/nodejs-docs-samples#prerequisites)
  2. Install Sox, this lib uses [node-record-lpcm16](https://github.com/gillesdemey/node-record-lpcm16) thats requires [Sox](http://sox.sourceforge.net/) to work,
  so if you are using MacOS just type `brew install sox`, and for others debian `sudo apt-get install sox libsox-fmt-all`


Usage example:
```javascript
var speech = require('google-speech-microphone');

speech.getSpeechService({
	GOOGLE_APPLICATION_CREDENTIALS: 'location/project-auth.json',
	GCLOUD_PROJECT: 'projectid'
})
.then(speechService => {
	return speech.sync({ speechService });
})
.then(res => {
	console.log(JSON.stringify(res));
})
.catch(err => {
	console.log(err);
});

```


------
[Very usefull google cloud examples in node](https://github.com/GoogleCloudPlatform/nodejs-docs-samples)
