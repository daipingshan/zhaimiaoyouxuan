const ftime = (t) => {
	const date = new Date();
	date.setTime(t * 1000);
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}
const ftimeToDate = (t) => {
	const date = new Date();
	date.setTime(t * 1000);
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()

	return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

function subString(str, len, hasDot) {
	var newLength = 0;
	var newStr = "";
	var chineseRegex = /[^\x00-\xff]/g;
	var singleChar = "";
	var strLength = str.replace(chineseRegex, "**").length;
	for (var i = 0; i < strLength; i++) {
		singleChar = str.charAt(i).toString();
		if (singleChar.match(chineseRegex) != null) {
			newLength += 2;
		}
		else {
			newLength++;
		}
		if (newLength > len) {
			break;
		}
		newStr += singleChar;
	}
	if (hasDot && strLength > len) {
		newStr += "...";
	}
	return newStr;
}

function getRandomArrayElements(arr, count) {
	var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
	while (i-- > min) {
		index = Math.floor((i + 1) * Math.random());
		temp = shuffled[index];
		shuffled[index] = shuffled[i];
		shuffled[i] = temp;
	}
	return shuffled.slice(min);
}

module.exports = {
	ftime: ftime,
	ftimeToDate: ftimeToDate,
	subString: subString,
	getRandomArrayElements: getRandomArrayElements
}
