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

	var hideUp = function ($inputs) {
		$inputs.animate({
			opacity: 0,
		}, this.slideDelay);
		setTimeout(function () {
			$inputs.css('z-index', -9999);
		}, 1000);
	}

	// CONSTRUCTOR FUNCTIONS

	var EndlessInput = function ($inputs) {
			this.$inputs = $inputs
		, this.$activeElement = this.$inputs.first()
		, this.slideDelay = 400
		;
	};

	EndlessInput.prototype.blurAndHideElements = function () {
		var majorBlur = 0.3
			, mediumBlur = 0.5
			, minorBlur = 0.8
			, normal = 1
			, $elementRightBeforeActive
			, $elementRightAfterActive
			, $elementTwoAfterActive
			, $elementsFarBefore
			, $elementsFarBeyond
			, selectorForTrueSiblings
			;

		// Refactor this into a specific method that takes in DISTANCE FROM ACTIVE! (-1, 0, 1, 2, etc);
		// Set all inputs to normal first
		// this.$inputs.css('opacity', normal);
		// this.$inputs.show();

		selectorForTrueSiblings = 'input[data-endless=' + this.$activeElement.data('endless') +']';

		$elementRightBeforeActive = this.$activeElement.prev(selectorForTrueSiblings);
		if ($elementRightBeforeActive) {
			hideUp($elementRightBeforeActive);
		}

		// $elementsFarBefore = this.$activeElement.prev(selectorForTrueSiblings).prevAll(selectorForTrueSiblings);
		// if ($elementsFarBefore) {
		// 	$elementsFarBefore.css('position', 'absolute');
		// 	$elementsFarBefore.offset({top: -9999, left: -9999});
		// }

		$elementRightAfterActive = this.$activeElement.next();
		if ($elementRightAfterActive) {
			$elementRightAfterActive.css('opacity', minorBlur);
		}

		$elementRightAfterActive = this.$activeElement.next().next();
		if ($elementRightAfterActive) {
			$elementRightAfterActive.css('opacity', mediumBlur);
		}

		$elementRightAfterActive = this.$activeElement.next().next().next();
		if ($elementRightAfterActive) {
			$elementRightAfterActive.css('opacity', majorBlur);
		}

		$elementsFarBeyond = this.$activeElement.next().next().next().nextAll();
		if ($elementsFarBeyond) {
			$elementsFarBeyond.hide();
		}
	};

	EndlessInput.prototype.activateInput = function ($input) {
		var distanceToScroll
			, topOfActiveElement
			, topOfThisElement
			;

		this.$inputs.css('position', 'relative');

		topOfThisElement = $input.position().top;
		distanceToScroll = topOfThisElement - this.activeElementFixedTop;

		this.$inputs.animate({
			top: "-=" + distanceToScroll
		}, this.slideDelay);

		this.$activeElement = $input;
		this.blurAndHideElements();
	};

	EndlessInput.prototype.init = function () {
		var that = this;

		// Highlight first element
		this.$inputs.first().focus();
		this.activeElementFixedTop = this.$inputs.first().position().top;

		this.blurAndHideElements();

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