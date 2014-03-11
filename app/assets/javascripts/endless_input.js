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
		$inputs.animate({
			opacity: 0
		}, this.inputsSlideDelay);
		$inputs.addClass('hide-with-z-index');
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
		, this.blurIncrement = 1 / this.visibleInputLength
		, this.permanentTop = this.$inputs.first().position().top;
		;

		if ($(this.$inputs.parent('form'))) {
			this.$form = $(this.$inputs.parent('form'));
			if (this.$form.find("input[type='submit']")) {
				this.$submitButton = this.$form.find("input[type='submit']");
			}
		}

		
		// HAVING ARROWS IS A CUSTOM OPTION TOO
	};

	EndlessInput.prototype.fadeElements = function () {
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

	EndlessInput.prototype.scrollElements = function ($newActiveElement) {
		// Make sure all inputs have position relative
		this.$inputs.css('position', 'relative');

		var topOfNewActiveElement = $newActiveElement.position().top;
		distanceToScroll = topOfNewActiveElement - this.permanentTop;

		this.$inputs.animate({
			top: "-=" + distanceToScroll
		}, this.inputsSlideDelay);

		if (this.$submitButton) {
			this.scrollSubmitButton(distanceToScroll);
		}
	}

	EndlessInput.prototype.setForm = function () {
		this.$form.css('max-height' , this.$form.height());
	}

	EndlessInput.prototype.scrollSubmitButton = function (distanceToScroll) {
		this.$submitButton.css('position', 'relative');
		this.$submitButton.animate({
			top: "-=" + distanceToScroll
		}, 0);
	}

	EndlessInput.prototype.activateInput = function ($newActiveElement) {
		this.$activeElement = $newActiveElement;
		this.scrollElements($newActiveElement);
		this.fadeElements($newActiveElement);
	};

	EndlessInput.prototype.init = function () {
		var that = this;

		this.$inputs.first().focus();
		this.fadeElements();
		if (this.$form) {
			this.setForm();
		}

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