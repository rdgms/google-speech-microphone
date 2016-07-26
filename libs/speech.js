'use strict';
const fs = require('fs');
const path = require('path');
const grpc = require('grpc');
const googleProtoFiles = require('google-proto-files');
const googleAuth = require('google-auto-auth');
const Transform = require('stream').Transform;
const record = require('node-record-lpcm16');

const service = {
	getSpeechProto: () => {
		var PROTO_ROOT_DIR = googleProtoFiles('..');
		var protoDescriptor = grpc.load({
			root: PROTO_ROOT_DIR,
			file: path.relative(PROTO_ROOT_DIR, googleProtoFiles.speech.v1beta1)
		}, 'proto', {
			binaryAsBase64: true,
			convertFieldsToCamelCase: true
		});

		return protoDescriptor.google.cloud.speech.v1beta1.Speech;
	},

	getSpeechService: (opt) => {
		process.env.GOOGLE_APPLICATION_CREDENTIALS = opt.GOOGLE_APPLICATION_CREDENTIALS;
		process.env.GCLOUD_PROJECT = opt.GCLOUD_PROJECT;

		const googleAuthClient = googleAuth({
			scopes: [
				'https://www.googleapis.com/auth/cloud-platform'
			]
		});

		return new Promise((resolve, reject) => {
			googleAuthClient.getAuthClient((err, authClient) => {
				if (err) {
					return reject(err);
				}

				const credentials = grpc.credentials.combineChannelCredentials(
					grpc.credentials.createSsl(),
					grpc.credentials.createFromGoogleCredential(authClient)
				);
				let Speech = service.getSpeechProto();

				const stub = new Speech('speech.googleapis.com', credentials);
				return resolve(stub);
			});
		});
	},
	sync: (opt) => {
		const speechService = opt.speechService;
		const onData = opt.onData;

		return new Promise((resolve, reject) => {
			let responses = [];
			const call = speechService.streamingRecognize();

			call.on('error', reject);
			call.on('data', function (recognizeResponse) {
				if (recognizeResponse) {
					responses.push(recognizeResponse);
					if (onData && recognizeResponse.results && recognizeResponse.results.length) {
						onData(recognizeResponse.results);
					}
				}
			});

			call.on('end', function () {
				resolve(responses);
			});

			call.write({
				streamingConfig: {
					config: {
						encoding: 'LINEAR16',
						sampleRate: 16000
					},
					interimResults: false,
					singleUtterance: false
				}
			});

			const toRecognizeRequest = new Transform({ objectMode: true });
			toRecognizeRequest._transform = function (chunk, encoding, done) {
				done(null, {
					audioContent: chunk
				});
			};

			record.start({
			   sampleRate: 44100,
			   verbose: true
		   })
		   .pipe(toRecognizeRequest)
		   .pipe(call);

		});
	}
};

module.exports = service;
