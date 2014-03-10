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

	EndlessInput.prototype.reBlurElements = function () {
		var majorBlur = 0.4
			, minorBlur = 0.7
			, normal = 1
			, $elementRightBeforeActive
			, $elementRightAfterActive
			, $elementTwoAfterActive
			, $elementsFarBefore
			, $elementsFarBeyond
			;

		// Refactor this into a specific method that takes in DISTANCE FROM ACTIVE! (-1, 0, 1, 2, etc);
		// Set all inputs to normal first
		this.$inputs.css('opacity', normal);
		this.$inputs.show();

		$elementsFarBefore = this.$activeElement.prevAll()
		if ($elementsFarBefore) {
			$elementsFarBefore.hide();
		}

		$elementRightBeforeActive = this.$activeElement.prev();
		if ($elementRightBeforeActive) {
			$elementRightBeforeActive.show();
			$elementRightBeforeActive.css('opacity', majorBlur);
		}

		// $elementsFarBeyond = this.$activeElement.nextAll()
		// if ($elementsFarBeyond) {
		// 	$elementsFarBefore.hide();	
		// }

		// $elementRightTwoAfterActive = this.$activeElement.next().next();
		// if ($elementTwoAfterActive) {
		// 	$elementTwoAfterActive.show();
		// 	$elementTwoAfterActive.css('opacity', majorBlur);
		// }

		// $elementRightAfterActive = this.$activeElement.next();
		// if ($elementRightAfterActive) {
		// 	$elementRightAfterActive.show();
		// 	$elementRightAfterActive.css('opacity', minorBlur);
		// }

	};

	EndlessInput.prototype.activateInput = function ($input) {
		var distanceToScroll
			, topOfActiveElement
			, topOfThisElement
			;

		topOfThisElement = $input.position().top;
		topOfActiveElement = this.$activeElement.position().top;
		distanceToScroll = topOfThisElement - topOfActiveElement;

		this.$inputs.css('position', 'relative');
		this.$inputs.animate({
			top: "-=" + distanceToScroll
		}, 400);

		this.$activeElement = $input;
		this.reBlurElements();
	};

	EndlessInput.prototype.init = function () {
		var that = this;
		// Highlight first element
		this.$inputs.first().focus();

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