'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var moment = require('moment');

var UserLogs = new Schema({

	created: {
		type: Date,        // 타입은 Date로 지정
		default: Date.now  // 기본값으로 현재 시간을 설정
	},
	event: {
		type: String
	},
	IPAddress: {
		type: String
	},
	ID: {
		type: String
	}

});


mongoose.model('UserLogs', UserLogs);



