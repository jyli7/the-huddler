(function () {
	// HELPER FUNCTIONS

	// Takes in jQuery objects as inputs, returns an object whose
	// key is the common value of data-endless, and whose value is
	// the array of jQuery objects that have that input value
	var getGroupingsForInputs = function ($inputs) {
		var result = {}
			, inputEndlessValue
			, $input
			;

		$.each($inputs, function (i, input) {
			$input = $(input);
			inputEndlessValue = $input.data('endless');
			result[inputEndlessValue] = result[inputEndlessValue] || [];
			result[inputEndlessValue].push($input);
		});
		return result;
	};

	// CONSTRUCTOR FUNCTIONS

	var EndlessInput = function ($inputs) {
		this.$inputs = $inputs;
		this.$activeElement = this.$inputs.first();
	};

	EndlessInput.prototype.activeElement = function () {

	}

	EndlessInput.prototype.activateInput = function ($input) {
		var distanceToScroll
			, topOfActiveElement
			, topOfThisElement
			;

		topOfThisElement = $input.position().top;
		topOfActiveElement = this.$activeElement.position().top;
		distanceToScroll = topOfThisElement - topOfActiveElement;

		this.$inputs.animate({
			top: "-=" + distanceToScroll
		}, 400);

		this.$activeElement = $input;
	};

	EndlessInput.prototype.init = function () {
		var that = this;
		// Highlight first element
		this.$inputs.first().focus();

		// Change position of elements to 'absolute'
		this.$inputs.css('position', 'relative');

		// Whenever you click into any element, move every element
		// by the distance between the top element and this element
		this.$inputs.on('focus', function () {
			that.activateInput($(this));
		});
	};


	// MAIN FUNCTION

	$(function () {
		var $allRelevantInputs
			, uniqueInputGroupings
			,	endlessInput
			;

		$allRelevantInputs = $('[data-endless]');
		uniqueInputGroupings = getGroupingsForInputs($allRelevantInputs);

		for (var key in uniqueInputGroupings) {
			var arrayOfJqueryObjects = uniqueInputGroupings[key];
			var $inputs = $(arrayOfJqueryObjects).map (function () { return this.toArray(); } );
			endlessInput = new EndlessInput($inputs);
			endlessInput.init();
		}
	});

	
}).call(this);