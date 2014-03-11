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

	var customHide = function ($inputs) {
		$inputs.addClass('hide-with-z-index');
		$inputs.animate({
			opacity: 0,
		}, this.inputsSlideDelay);
	}

	var customShow = function ($inputs) {
		$inputs.animate({
			opacity: 1
		}, this.inputsSlideDelay * 0.5);
		$inputs.removeClass('hide-with-z-index');
	}

	// CONSTRUCTOR FUNCTIONS

	var EndlessInput = function ($inputs) {
			this.$inputs = $inputs
		, this.$activeElement = this.$inputs.first()
		// CUSTOM OPTION
		// BLURRING IS A FUNCTION OF INPUT LENGTH! MIN INPUT LENGTH OF 3
		, this.visibleInputLength = 5
		, this.minLength = 3

		// CUSTOM OPTION
		, this.inputsSlideDelay = 250
		, this.selector = 'input[data-endless=' + 
											this.$activeElement.data('endless') +']'
		, this.blurIncrement = 1 / this.visibleInputLength;
		// HAVING ARROWS IS A CUSTOM OPTION TOO
		;
	};


	EndlessInput.prototype.blurElement = function ($element) {

	}

	EndlessInput.prototype.resetSpecificElement = function (distanceFromActive) {
		var $elementToModify;

		if (distanceFromActive === 0) {
			customShow(this.$activeElement);
		} else if (distanceFromActive === -1) {
			$elementToModify = this.$activeElement.prev(this.selector);
		} else if (distanceFromActive === 1) {
			$elementToModify = this.$activeElement.next(this.selector);
		} else if (distanceFromActive === 2) {
			$elementToModify = this.$activeElement.next(this.selector)
																						.next(this.selector);
		} else if (distanceFromActive === 3) {
			$elementToModify = this.$activeElement.next(this.selector)
																						.next(this.selector)
																						.next(this.selector);			
		}

		$elementsFarBeyond = this.$activeElement.next(this.selector).next(this.selector).next(this.selector).nextAll(this.selector);
		if ($elementsFarBeyond) {
			$elementsFarBeyond.hide();
		}



	}

	EndlessInput.prototype.resetElements = function () {
		// Reset all elements before active element, if they exist
		var $previousElements = this.$activeElement.prevAll(this.selector);
		if ($previousElements) {
			customHide($previousElements);
		}
		
		// Reset active element
		customShow(this.$activeElement);

		// Reset all visible elements after active element
		var $activeElementIndex = this.$inputs.index(this.$activeElement);
		for (var i = $activeElementIndex + 1;
				 i < $activeElementIndex + this.visibleInputLength; i++) {
				
			var $el = $(this.$inputs.get(i));
			var distanceFromActive = i - $activeElementIndex;
			$el.show();
			$el.css('opacity', 1 - this.blurIncrement * distanceFromActive);
		}

		// Reset all elements AFTER all visible ones
		var lastVisibleIndex = $activeElementIndex + this.visibleInputLength - 1;
		var $lastVisibleEl = $(this.$inputs.get(lastVisibleIndex));
		$lastVisibleEl.nextAll(this.selector).hide();
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
		}, this.inputsSlideDelay);

		this.$activeElement = $input;
		this.resetElements();
	};

	EndlessInput.prototype.init = function () {
		var that = this;

		// Highlight first element
		this.$inputs.first().focus();
		this.activeElementFixedTop = this.$inputs.first().position().top;

		this.resetElements();

		// Whenever you click into any element, move every element
		// by the distance between the top element and this element
		this.$inputs.on('focus', function () {
			that.activateInput($(this));
		});

		// NOTE: Add arrows first, then implement selective showing of arrows
		// REFACTOR ALL OF THIS!
		this.$inputs.last().after("<div class='endless-input-arrow-up'>");
		this.$inputs.last().after("<div class='endless-input-arrow-down'>");

		var secondInputTop = this.$inputs.first().next().position().top;
		var upArrowTop = $('.endless-input-arrow-up').position().top;
		var secondInputWidth = this.$inputs.first().next().width();
		var secondInputHeight = this.$inputs.first().next().height();

		var upArrowMoveBottom = upArrowTop - secondInputTop - secondInputHeight;
		var upArrowMoveLeft = secondInputWidth + 15;

		$('.endless-input-arrow-up').css({bottom: upArrowMoveBottom, left: upArrowMoveLeft});

		var thirdInputTop = this.$inputs.first().next().next().position().top;
		var downArrowTop = $('.endless-input-arrow-down').position().top;
		var thirdInputWidth = this.$inputs.first().next().next().width();
		var thirdInputHeight = this.$inputs.first().next().next().height();

		var downArrowMoveBottom = downArrowTop - thirdInputTop - 10;
		var downArrowMoveLeft = thirdInputWidth + 34;

		$('.endless-input-arrow-down').css({bottom: downArrowMoveBottom, left: downArrowMoveLeft});

		var upArrowLeft = $('.endless-input-arrow-up').position().left;
		var upArrowTop = $('.endless-input-arrow-up').position().top;

		var downArrowLeft = $('.endless-input-arrow-down').position().left;
		var downArrowTop = $('.endless-input-arrow-down').position().top;

		$('.endless-input-arrow-up').css({position: 'absolute', left: upArrowLeft, top: upArrowTop});
		$('.endless-input-arrow-down').css({position: 'absolute', left: downArrowLeft, top: downArrowTop});


		// NEED TO DO SMART PREV HERE, NOT JUST STUPID PREV
		$('.endless-input-arrow-up').on('click', function () {
			if (that.$activeElement.prev()) {
				that.$activeElement.prev().focus();	
			}
		});

		$('.endless-input-arrow-down').on('click', function () {
			if (that.$activeElement.next()) {
				that.$activeElement.next().focus();	
			}
		});
	};


	// MAIN FUNCTION
	$(function () {
		var $allRelevantInputs
			, uniqueInputGroupings
			,	endlessInput
			;

		// Grab all inputs marked with a data-endless value
		$allRelevantInputs = $('[data-endless]');

		// Sort those inputs into groups that have the same data-endless value
		uniqueInputGroupings = getGroupingsForInputs($allRelevantInputs);

		// Initialize endless input for each of those groupings
		for (var key in uniqueInputGroupings) {
			var arrayOfJqueryObjects = uniqueInputGroupings[key];
			var $inputs = $(arrayOfJqueryObjects).map (function () { return this.toArray(); } );
			endlessInput = new EndlessInput($inputs);
			endlessInput.init();
		}
	});
	
}).call(this);