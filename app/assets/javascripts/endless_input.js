$(function () {
		// Takes in jQuery objects as inputs, returns an object whose
	// key is the common value of data-endless, and whose value is
	// the array of jQuery objects that have that input value
	var getGroupingsForInputs = function ($inputs) {
		var result = {};
		var thisInputValue;
		$.each($inputs, function (i, input) {
			var $input = $(input);
			thisInputValue = $input.data('endless');
			result[thisInputValue] = result[thisInputValue] || [];
			result[thisInputValue].push($input);
		});
		return result;
	};

	var $allRelevantInputs = $('[data-endless]');
	var uniqueInputGroupings = getGroupingsForInputs($allRelevantInputs);

});