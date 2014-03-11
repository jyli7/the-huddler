(function () {
	// HELPER FUNCTIONS

	// Takes in jQuery objects as inputs, returns an object whose
	// key is a particular value for data-endless, and whose value is
	// the array of jQuery objects that have that same data-endless value
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

	// Use customHide in place of jQuery's hide for our inputs, to avoid
	// removal from DOM (which creates funky movement of inputs)
	var customHide = function ($inputs) {
		$inputs.animate({
			opacity: 0
		}, this.inputsSlideDelay);
		$inputs.addClass('hide-with-z-index');
	}

	// Use customShow as inverse of customHide
	var customShow = function ($inputs) {
		$inputs.animate({
			opacity: 1
		}, this.inputsSlideDelay * 0.5);
		$inputs.removeClass('hide-with-z-index');
	}

	// Our main constructor function
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
		, this.fadeIncrement = 1 / this.visibleInputLength
		, this.permanentTop = this.$inputs.first().position().top
		, this.sections = {
													 'beforeActive' : undefined,
													 'active' : undefined,
													 'visible' : undefined,
													 'afterVisible' : undefined
													}
		, this.$upArrow = undefined
		, this.$downArrow = undefined
		, this.distanceBetweenArrows = 35
		, this.arrowDistancePastInputs = 35
		;

		if ($(this.$inputs.parent('form'))) {
			this.$form = $(this.$inputs.parent('form'));
			if (this.$form.find("input[type='submit']")) {
				this.$submitButton = this.$form.find("input[type='submit']");
			}
		}
		
		// HAVING ARROWS IS A CUSTOM OPTION TOO
	};

	// "Smart" function that fades the visible element appropriately,
	// given distance from active
	EndlessInput.prototype.fadeVisibleElement = function ($el, distanceFromActive) {
		$el.show();
		$el.css('opacity', 1 - this.fadeIncrement * distanceFromActive);
	}

	EndlessInput.prototype.fadeOrHideSections = function () {
		var $beforeActive
			, $active
			, $visible
			, $afterVisible
			, activeElementIndex
			, firstVisibleElIndex
			, i
			;

		$beforeActive = this.sections['beforeActive'];
		$active = this.sections['active'];
		$visible = this.sections['visible'];
		$afterVisible = this.sections['afterVisible'];

		if ($beforeActive && $beforeActive.length) {
			customHide($beforeActive);
		}

		customShow($active);

		if ($visible && $visible.length) {
			activeElementIndex = this.$inputs.index(this.$activeElement);
			firstVisibleElIndex = activeElementIndex + 1;
			lastVisibleIndex = activeElementIndex + this.visibleInputLength - 1;
			for (i = firstVisibleElIndex; i <= lastVisibleIndex; i++) {
				this.fadeVisibleElement($(this.$inputs.get(i)), i - activeElementIndex);
			}
		}

		if ($afterVisible && $afterVisible.length) {
			$afterVisible.hide();
		} 
	}

	EndlessInput.prototype.fadeOrHideElements = function () {
		var activeElementIndex
			, lastVisibleIndex
			, $lastVisibleEl
			, that
			;

		that = this;

		// 1) Set sections
		this.sections['beforeActive'] = this.$activeElement.prevAll(this.selector);
		this.sections['active'] = this.$activeElement;

		activeElementIndex = this.$inputs.index(this.$activeElement);
		this.sections['visible'] = this.$inputs
																  .slice(activeElementIndex,
																				 activeElementIndex
																				 + this.visibleInputLength);

		lastVisibleIndex = activeElementIndex + this.visibleInputLength - 1;
		$lastVisibleEl = $(this.$inputs.get(lastVisibleIndex));
		this.sections['afterVisible'] = $lastVisibleEl.nextAll(this.selector);

		// 2) Fade or hide secetions
		this.fadeOrHideSections();
	};

	EndlessInput.prototype.scrollElements = function ($newActiveElement) {
		this.$inputs.css('position', 'relative');
		distanceToScroll = $newActiveElement.position().top - this.permanentTop;

		this.$inputs.animate({
			top: "-=" + distanceToScroll
		}, this.inputsSlideDelay);

		if (this.$submitButton) {
			this.scrollSubmitButton(distanceToScroll);
		}
	}

	EndlessInput.prototype.fixFormHeight = function () {
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
		this.fadeOrHideElements($newActiveElement);
		this.revealArrowsAppropriately();
	};

	EndlessInput.prototype.generateArrows = function () {
		// Place the arrows into the BODY
		$('body').append("<div class='endless-input-arrow-up'>");
		$('body').append("<div class='endless-input-arrow-down'>");
		this.$upArrow = $('.endless-input-arrow-up');
		this.$downArrow = $('.endless-input-arrow-down');
		this.$upArrow.css('position', 'absolute');
		this.$downArrow.css('position', 'absolute');
	}

	EndlessInput.prototype.placeArrows = function () {
		var topOfVisibles
			, activeElementIndex
			, lastVisibleIndex
			, $lastVisibleEl
			, bottomOfVisibles
			, heightOfAllVisibles
			, midpointOfAllVisibles
			, upArrowBottom
			, downArrowTop
			, inputRightSide
			;

		if (this.$upArrow && this.$downArrow) {
			// Find the top/left positions we want to set
			// We will place arrows in MIDDLE of inputs, and on right hand side
			topOfVisibles = this.$activeElement.offset().top;
			activeElementIndex = this.$inputs.index(this.$activeElement);
			lastVisibleIndex = activeElementIndex + this.visibleInputLength - 1;
			$lastVisibleEl = $(this.$inputs.get(lastVisibleIndex));
			bottomOfVisibles = $lastVisibleEl.offset().top + $lastVisibleEl.height();
			
			heightOfAllVisibles = bottomOfVisibles - topOfVisibles;
			midpointOfAllVisibles = topOfVisibles + (heightOfAllVisibles / 2);

			upArrowBottom = midpointOfAllVisibles -
													this.distanceBetweenArrows / 2;
			this.$upArrow.css('top', upArrowBottom - this.$upArrow.height());

			downArrowTop = midpointOfAllVisibles +
												 this.distanceBetweenArrows / 2;
			this.$downArrow.css('top', downArrowTop);

			// We assume inputs are of equal width
			inputRightSide = this.$activeElement.offset().left + 
													 this.$activeElement.width();

			this.$upArrow.css('left', inputRightSide + this.arrowDistancePastInputs);

			this.$downArrow.css('left', inputRightSide + this.arrowDistancePastInputs);
		}
	}

	EndlessInput.prototype.activateArrows = function () {
		var that = this;
		this.$upArrow.on('click', function () {
			if (that.$activeElement.prev()) {
				that.$activeElement.prev().focus();	
			}
		});

		this.$downArrow.on('click', function () {
			if (that.$activeElement.next()) {
				that.$activeElement.next().focus();	
			}
		});
	}

	EndlessInput.prototype.revealArrowsAppropriately = function () {
		var lastElementIndex
				;

		this.$upArrow.removeClass('endless-hidden');
		this.$downArrow.removeClass('endless-hidden');

		lastElementIndex = this.$inputs.index(this.$inputs.last());
		
		if (this.$inputs.index(this.$activeElement) === 0) {
			this.$upArrow.addClass('endless-hidden');
		} else if (this.$inputs.index(this.$activeElement) === lastElementIndex) {
			this.$downArrow.addClass('endless-hidden');
		}
	}

	EndlessInput.prototype.init = function () {
		var that = this;

		this.$inputs.first().focus();
		this.fadeOrHideElements();
		if (this.$form) {
			this.fixFormHeight();
		}

		this.$inputs.on('focus', function () {
			that.activateInput($(this));
		});

		// NOTE: Add arrows first, then implement selective showing of arrows
		// REFACTOR ALL OF THIS!
		this.generateArrows();
		this.placeArrows();
		this.activateArrows();
		this.revealArrowsAppropriately();
	};


	// MAIN FUNCTION
	$(function () {
		var $allRelevantInputs
			, uniqueInputGroupings
			,	endlessInput
			, arrayOfJqueryObjects
			, $inputs
			;

		// Grab all inputs marked with a data-endless value
		$allRelevantInputs = $('[data-endless]');

		// Sort those inputs into groups that have the same data-endless value
		uniqueInputGroupings = getGroupingsForInputs($allRelevantInputs);

		// Initialize endless input for each of those groupings
		for (var key in uniqueInputGroupings) {
			arrayOfJqueryObjects = uniqueInputGroupings[key];
			$inputs = $(arrayOfJqueryObjects).map (function () { return this.toArray(); } );
			endlessInput = new EndlessInput($inputs);
			endlessInput.init();
		}
	});
	
}).call(this);