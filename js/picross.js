$(function() {

	// localStorage save format versioning
	const saveVersion = '24.08.2023';
	const maxMistakes = 5;
	const touchSupport = true;

	const PuzzleModel = Backbone.Model.extend({

		defaults: function () {
			return {
				dimensionWidth: 10,		// default dimension width
				dimensionHeight: 10,	// default dimension height
				solution: [],
				state: [],
				hintsX: [],
				hintsY: [],
				mistakes: 0,
				guessed: 0,
				total: 100,
				complete: false,
				seed: 0,
				forgiving: false,
				funMode: false,
				hardMode: false, // 
				easyMode: true	// show crossouts
			};
		},

		initialize: function () {
			this.on('change', this.save);
		},

		save: function () {
			if (localStorageSupport()) {
				localStorage['picross.saveVersion'] = saveVersion;

				localStorage['picross.dimensionWidth'] = JSON.stringify(this.get('dimensionWidth'));
				localStorage['picross.dimensionHeight'] = JSON.stringify(this.get('dimensionHeight'));
				localStorage['picross.solution'] = JSON.stringify(this.get('solution'));
				localStorage['picross.state'] = JSON.stringify(this.get('state'));
				localStorage['picross.hintsX'] = JSON.stringify(this.get('hintsX'));
				localStorage['picross.hintsY'] = JSON.stringify(this.get('hintsY'));
				localStorage['picross.mistakes'] = JSON.stringify(this.get('mistakes'));
				localStorage['picross.guessed'] = JSON.stringify(this.get('guessed'));
				localStorage['picross.total'] = JSON.stringify(this.get('total'));
				localStorage['picross.complete'] = JSON.stringify(this.get('complete'));
				localStorage['picross.seed'] = JSON.stringify(this.get('seed'));
				localStorage['picross.forgiving'] = JSON.stringify(this.get('forgiving'));
				localStorage['picross.funMode'] = JSON.stringify(this.get('funMode'));
				localStorage['picross.hardMode'] = JSON.stringify(this.get('hardMode'));
				localStorage['picross.easyMode'] = JSON.stringify(this.get('easyMode'));
			}
		},

		resume: function () {

			if (!localStorageSupport() || localStorage['picross.saveVersion'] !== saveVersion) {
				this.reset();
				return;
			}

			let dimensionWidth = JSON.parse(localStorage['picross.dimensionWidth']);
			let dimensionHeight = JSON.parse(localStorage['picross.dimensionHeight']);
			let solution = JSON.parse(localStorage['picross.solution']);
			let state = JSON.parse(localStorage['picross.state']);
			let hintsX = JSON.parse(localStorage['picross.hintsX']);
			let hintsY = JSON.parse(localStorage['picross.hintsY']);
			let mistakes = JSON.parse(localStorage['picross.mistakes']);
			let guessed = JSON.parse(localStorage['picross.guessed']);
			let total = JSON.parse(localStorage['picross.total']);
			let complete = JSON.parse(localStorage['picross.complete']);
			let seed = JSON.parse(localStorage['picross.seed']);
			let forgiving = JSON.parse(localStorage['picross.forgiving']);
			let funMode = JSON.parse(localStorage['picross.funMode']);
			let hardMode = JSON.parse(localStorage['picross.hardMode']);
			let easyMode = JSON.parse(localStorage['picross.easyMode']);

			this.set({
				dimensionWidth: dimensionWidth,
				dimensionHeight: dimensionHeight,
				solution: solution,
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				mistakes: mistakes,
				guessed: guessed,
				total: total,
				complete: complete,
				seed: seed,
				forgiving: forgiving,
				funMode: funMode,
				hardMode: hardMode,
				easyMode: easyMode
			});
		},

		reset: function (customSeed) {
			let streak;
			let i;
			let j;
			let seed = customSeed;
			if (seed === undefined) {
				seed = '' + new Date().getTime();
			}
			Math.seedrandom(seed);

			let solution = [];
			let state = [];
			let total = 0;
			
			const dimHeight = this.get('dimensionHeight');
			const dimWidth = this.get('dimensionWidth');
			let random;
			
			for (i = 0; i < dimHeight; i++) {
				solution[i] = [];
				state[i] = [];
				for (j = 0; j < dimWidth; j++) {
					random = Math.ceil(Math.random() * 2);
					solution[i][j] = random;
					total += (random - 1);
					state[i][j] = 0;
				}
			}

			if (this.get('funMode')) {
				const offset = Math.floor(Math.random() * 3);
				const border = Math.ceil(Math.random() * 4);

				let offsetIndex = 0;
				if (border === 1) {
					offsetIndex = offset;
					for (i = 0; i < dimHeight; i++) {
						if (solution[i][offsetIndex] === 2) continue;
						random = Math.ceil(Math.random() * 2);
						solution[i][offsetIndex] = random;
						total += (random - 1);
					}
				}
				if (border === 2) {
					offsetIndex = dimHeight - (offset + 1);
					for (i = 0; i < dimHeight; i++) {
						if (solution[i][offsetIndex] === 2) continue;
						random = Math.ceil(Math.random() * 2);
						solution[i][offsetIndex] = random;
						total += (random - 1);
					}
				}
				if (border === 3) {
					offsetIndex = offset;
					for (j = 0; j < dimWidth; j++) {
						if (solution[offsetIndex][j] === 2) continue;
						random = Math.ceil(Math.random() * 2);
						solution[offsetIndex][j] = random;
						total += (random - 1);
					}
				}
				if (border === 4) {
					offsetIndex = dimWidth - (offset + 1);
					for (j = 0; j < dimWidth; j++) {
						if (solution[offsetIndex][j] === 2) continue;
						random = Math.ceil(Math.random() * 2);
						solution[offsetIndex][j] = random;
						total += (random - 1);
					}
				}
			}

			const hintsX = [];
			const hintsY = [];

			for (i = 0; i < dimHeight; i++) {
				streak = 0;
				hintsX[i] = [];
				for (j = 0; j < dimWidth; j++) {
					if (solution[i][j] === 1) {
						if (streak > 0) {
							hintsX[i].push(streak);
						}
						streak = 0;
					} else {
						streak++;
					}
				}
				if (streak > 0) {
					hintsX[i].push(streak);
				}
			}

			for (j = 0; j < dimWidth; j++) {
				streak = 0;
				hintsY[j] = [];
				for (i = 0; i < dimHeight; i++) {
					if (solution[i][j] === 1) {
						if (streak > 0) {
							hintsY[j].push(streak);
						}
						streak = 0;
					} else {
						streak++;
					}
				}
				if (streak > 0) {
					hintsY[j].push(streak);
				}
			}

			this.set({
				solution: solution,
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				mistakes: 0,
				guessed: 0,
				total: total,
				complete: false,
				seed: seed
			}, {silent: true});
			this.trigger('change');
		},

		guess: function (x, y, guess) {
			let j;
			let streak;
			let i;
			const solution = this.get('solution')[x][y];
			const state = this.get('state');
			const hintsX = this.get('hintsX');
			const hintsY = this.get('hintsY');
			let mistakes = this.get('mistakes');
			let guessed = this.get('guessed');

			if (state[x][y] !== 0) {
				// already guessed
				return;
			}

			if (solution === guess) {
				state[x][y] = guess;
			} else {
				state[x][y] = solution * -1;
				mistakes++;
			}

			if (solution === 2) {
				guessed++;
			}

			// cross out x -- left
			let tracker = 0;
			for (i = 0; i < hintsX[x].length; i++) {
				while (Math.abs(state[x][tracker]) === 1) {
					tracker++;
				}
				if (state[x][tracker] === 0) {
					break;
				}
				streak = hintsX[x][i];
				if (streak < 0) {
					tracker += Math.abs(streak);
					continue;
				}
				for (j = 1; j <= streak; j++) {
					if (Math.abs(state[x][tracker]) === 2) {
						tracker++;
						if (j === streak && (tracker === state[0].length || Math.abs(state[x][tracker]) === 1)) {
							hintsX[x][i] = streak * -1;
						}
					} else {
						break;
					}
				}
			}
			// cross out x -- right
			tracker = state[0].length - 1;
			for (i = hintsX[x].length - 1; i >= 0; i--) {
				while (Math.abs(state[x][tracker]) === 1) {
					tracker--;
				}
				if (state[x][tracker] === 0) {
					break;
				}
				streak = hintsX[x][i];
				if (streak < 0) {
					tracker -= Math.abs(streak);
					continue;
				}
				for (j = 1; j <= streak; j++) {
					if (Math.abs(state[x][tracker]) === 2) {
						tracker--;
						if (j === streak && (tracker === -1 || Math.abs(state[x][tracker]) === 1)) {
							hintsX[x][i] = streak * -1;
						}
					} else {
						break;
					}
				}
			}
			// cross out y -- top
			tracker = 0;
			for (i = 0; i < hintsY[y].length; i++) {
				while (Math.abs(state[tracker][y]) === 1) {
					tracker++;
				}
				if (state[tracker][y] === 0) {
					break;
				}
				streak = hintsY[y][i];
				if (streak < 0) {
					tracker += Math.abs(streak);
					continue;
				}
				for (j = 1; j <= streak; j++) {
					if (Math.abs(state[tracker][y]) === 2) {
						tracker++;
						if (j === streak && (tracker === state.length || Math.abs(state[tracker][y]) === 1)) {
							hintsY[y][i] = streak * -1;
						}
					} else {
						break;
					}
				}
			}
			// cross out y -- bottom
			tracker = state.length - 1;
			for (i = hintsY[y].length - 1; i >= 0; i--) {
				while (Math.abs(state[tracker][y]) === 1) {
					tracker--;
				}
				if (state[tracker][y] === 0) {
					break;
				}
				streak = hintsY[y][i];
				if (streak < 0) {
					tracker -= Math.abs(streak);
					continue;
				}
				for (j = 1; j <= streak; j++) {
					if (Math.abs(state[tracker][y]) === 2) {
						tracker--;
						if (j === streak && (tracker === -1 || Math.abs(state[tracker][y]) === 1)) {
							hintsY[y][i] = streak * -1;
						}
					} else {
						break;
					}
				}
			}

			this.set({
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				mistakes: mistakes,
				guessed: guessed
			}, {silent: true});
			this.trigger('change');
		}

	});

	const PuzzleView = Backbone.View.extend({

		el: $("body"),

		events: function () {
			if (touchSupport && 'ontouchstart' in document.documentElement) {
				return {
					"click #new": "newGame",
					"change #forgiving": "changeForgiving",
					"change #funMode": "changeFunMode",
					"change #hardMode": "changeHardMode",
					"change #easy": "changeEasyMode",
					"mousedown": "clickStart",
					"mouseover td.cell": "mouseOver",
					"mouseout td.cell": "mouseOut",
					"mouseup": "clickEnd",
					"touchstart td.cell": "touchStart",
					"touchmove td.cell": "touchMove",
					"touchend td.cell": "touchEnd",
					"submit #customForm": "newCustom",
					"click #seed": function (e) {
						e.currentTarget.select();
					},
					"click #customSeed": function (e) {
						e.currentTarget.select();
					},
					"contextmenu": function (e) {
						e.preventDefault();
					}
				}
			} else {
				return {
					"click #new": "newGame",
					"change #forgiving": "changeForgiving",
					"change #funmode": "changeFunMode",
					"change #hardMode": "changeHardMode",
					"change #easy": "changeEasyMode",
					"mousedown": "clickStart",
					"mouseover td.cell": "mouseOver",
					"mouseout td.cell": "mouseOut",
					"mouseup": "clickEnd",
					"submit #customForm": "newCustom",
					"click #seed": function (e) {
						e.currentTarget.select();
					},
					"click #customSeed": function (e) {
						e.currentTarget.select();
					},
					"contextmenu": function (e) {
						e.preventDefault();
					}
				}
			}
		},

		mouseStartX: -1,
		mouseStartY: -1,
		mouseEndX: -1,
		mouseEndY: -1,
		mouseMode: 0,

		initialize: function () {
			this.model.resume();
			$('#dimensions').val(this.model.get('dimensionWidth') + 'x' + this.model.get('dimensionHeight'));
			if (this.model.get('forgiving')) {
				$('#forgiving').attr('checked', 'checked');
			} else {
				$('#forgiving').removeAttr('checked');
			}			
			if (this.model.get('funMode')) {
				$('#funmode').attr('checked', 'checked');
			} else {
				$('#funmode').removeAttr('checked');
			}
			if (this.model.get('hardMode')) {
				$('#hardmode').attr('checked', 'checked');
			} else {
				$('#hardmode').removeAttr('checked');
			}
			if (this.model.get('easyMode')) {
				$('#easy').attr('checked', 'checked');
			} else {
				$('#easy').removeAttr('checked');
			}
			this.render();
			this.showSeed();
		},

		changeForgiving: function () {
			const forgiving = $('#forgiving').attr('checked') !== undefined;
			this.model.set({forgiving: forgiving});
			this.render();
		},
		
		changeFunMode: function () {
			const funMode = $('#funmode').attr('checked') !== undefined;
			this.model.set({funMode: funMode});
			this.render();
		},

		changeHardMode: function () {
			const hardMode = $('#hardmode').attr('checked') !== undefined;
			this.model.set({hardMode: hardMode});
			this.render();
		},

		changeEasyMode: function () {
			const easyMode = $('#easy').attr('checked') !== undefined;
			this.model.set({easyMode: easyMode});
			this.render();
		},

		changeDimensions: function () {
			let dimensions = $('#dimensions').val();
			dimensions = dimensions.split('x');
			this.model.set({
				dimensionWidth: dimensions[0],
				dimensionHeight: dimensions[1]
			});
		},

		_newGame: function (customSeed) {
			const puzzleObj=$('#puzzle');
			puzzleObj.removeClass('complete');
			puzzleObj.removeClass('perfect');
			$('#progress').removeClass('done');
			$('#mistakes').removeClass('error');
			this.changeDimensions();
			this.model.reset(customSeed);
			this.render();
			this.showSeed();
		},

		newGame: function () {
			$('#customSeed').val('');
			this._newGame();
		},

		newCustom: function (e) {
			e.preventDefault();

			const customSeed = $.trim($('#customSeed').val());
			if (customSeed.length) {
				this._newGame(customSeed);
			} else {
				this._newGame();
			}
		},

		showSeed: function () {
			const seed = this.model.get('seed');
			$('#seed').val(seed);
		},

		clickStart: function (e) {
			if (this.model.get('complete')) {
				return;
			}

			const target = $(e.target);

			if (this.mouseMode !== 0 || target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
				this.mouseMode = 0;
				this.render();
				return;
			}

			this.mouseStartX = target.attr('data-x');
			this.mouseStartY = target.attr('data-y');
			switch (e.which) {
				case 1:
					// left click
					e.preventDefault();
					this.mouseMode = 1;
					break;
				case 3:
					// right click
					e.preventDefault();
					this.mouseMode = 3;
					break;
			}
		},

		mouseOver: function (e) {
			let i;
			let end;
			let start;
			const target = $(e.currentTarget);
			const endX = target.attr('data-x');
			const endY = target.attr('data-y');
			this.mouseEndX = endX;
			this.mouseEndY = endY;

			$('td.hover').removeClass('hover');
			$('td.hoverLight').removeClass('hoverLight');

			if (this.mouseMode === 0) {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + '][data-y=' + endY + ']').addClass('hover');
				return;
			}

			const startX = this.mouseStartX;
			const startY = this.mouseStartY;

			if (startX === -1 || startY === -1) {
				return;
			}

			const diffX = Math.abs(endX - startX);
			const diffY = Math.abs(endY - startY);

			if (diffX > diffY) {
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				start = Math.min(startX, endX);
				end = Math.max(startX, endX);
				for (i = start; i <= end; i++) {
					$('td.cell[data-x=' + i + '][data-y=' + startY + ']').addClass('hover');
				}
			} else {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				start = Math.min(startY, endY);
				end = Math.max(startY, endY);
				for (i = start; i <= end; i++) {
					$('td.cell[data-x=' + startX + '][data-y=' + i + ']').addClass('hover');
				}
			}
		},

		mouseOut: function () {
			if (this.mouseMode === 0) {
				$('td.hover').removeClass('hover');
				$('td.hoverLight').removeClass('hoverLight');
			}
		},

		clickEnd: function (e) {
			if (this.model.get('complete')) {
				return;
			}

			const target = $(e.target);
			switch (e.which) {
				case 1:
					// left click
					e.preventDefault();
					if (this.mouseMode !== 1) {
						this.mouseMode = 0;
						return;
					}
					if (target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 2);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 2);
					}
					break;
				case 3:
					// right click
					e.preventDefault();
					if (this.mouseMode !== 3) {
						this.mouseMode = 0;
						return;
					}
					if (target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 1);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 1);
					}
					break;
			}
			this.mouseMode = 0;
			this.checkCompletion();
			this.render();
		},

		clickArea: function (endX, endY, guess) {
			let i;
			const startX = this.mouseStartX;
			const startY = this.mouseStartY;

			if (startX === -1 || startY === -1) {
				return;
			}

			const diffX = Math.abs(endX - startX);
			const diffY = Math.abs(endY - startY);

			if (diffX > diffY) {
				for (i = Math.min(startX, endX); i <= Math.max(startX, endX); i++) {
					this.model.guess(i, startY, guess);
				}
			} else {
				for (i = Math.min(startY, endY); i <= Math.max(startY, endY); i++) {
					this.model.guess(startX, i, guess);
				}
			}
		},

		touchStart: function (e) {
			if (this.model.get('complete')) {
				return;
			}
			const target = $(e.target);
			this.mouseStartX = this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseStartY = this.mouseEndY = e.originalEvent.touches[0].pageY;
			const that = this;
			this.mouseMode = setTimeout(function () {
				that.model.guess(target.attr('data-x'), target.attr('data-y'), 1);
				that.render();
			}, 750);
		},

		touchMove: function (e) {
			if (this.model.get('complete')) {
				return;
			}
			this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseEndY = e.originalEvent.touches[0].pageY;
			if (Math.abs(this.mouseEndX - this.mouseStartX) >= 10 || Math.abs(this.mouseEndY - this.mouseStartY) >= 10) {
				clearTimeout(this.mouseMode);
			}
		},

		touchEnd: function (e) {
			if (this.model.get('complete')) {
				return;
			}
			clearTimeout(this.mouseMode);
			const target = $(e.target);
			if (Math.abs(this.mouseEndX - this.mouseStartX) < 10 && Math.abs(this.mouseEndY - this.mouseStartY) < 10) {
				this.model.guess(target.attr('data-x'), target.attr('data-y'), 2);
				this.checkCompletion();
				this.render();
			}
		},

		checkCompletion: function () {
			let j;
			if (this.model.get('complete')) {
				return;
			}

			const guessed = this.model.get('guessed');
			const total = this.model.get('total');

			if (guessed === total) {
				let i;
				const hintsX = this.model.get('hintsX');
				const hintsY = this.model.get('hintsY');

				for (i = 0; i < hintsX.length; i++) {
					for (j = 0; j < hintsX[i].length; j++) {
						hintsX[i][j] = Math.abs(hintsX[i][j]) * -1;
					}
				}
				for (i = 0; i < hintsY.length; i++) {
					for (j = 0; j < hintsY[i].length; j++) {
						hintsY[i][j] = Math.abs(hintsY[i][j]) * -1;
					}
				}

				this.model.set({
					complete: true,
					hintsX: hintsX,
					hintsY: hintsY
				});
			}
		},

		render: function () {
			let j;
			let i;
			const mistakes = this.model.get('mistakes');
			let format= `${mistakes}`;
			if (this.model.get('forgiving')) {
				format= `${mistakes} (${maxMistakes})`;
			}
			const mistakesObj=$('#mistakes');
			mistakesObj.text(format);
		
			if (mistakes > 0) {
				mistakesObj.addClass('error');
			}

			const progress = this.model.get('guessed') / this.model.get('total') * 100;
			const progressObj=$('#progress');
			progressObj.text(progress.toFixed(1) + '%');
			
			const puzzleObj=$('#puzzle');
			if (this.model.get('complete')) {
				puzzleObj.addClass('complete');
				progressObj.addClass('done');
				if (this.model.get('forgiving')) {
					if (mistakes <= maxMistakes) {
						puzzleObj.addClass('perfect');
					}
				} else {
					if (mistakes === 0) {
						puzzleObj.addClass('perfect');
					}
				}
			}

			const state = this.model.get('state');
			const hintsX = this.model.get('hintsX');
			const hintsY = this.model.get('hintsY');

			const hintsXText = [];
			const hintsYText = [];
			if (this.model.get('easyMode')) {
				for (i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for (j = 0; j < hintsX[i].length; j++) {
						if (hintsX[i][j] < 0) {
							hintsXText[i][j] = '<em>' + Math.abs(hintsX[i][j]) + '</em>';
						} else {
							hintsXText[i][j] = hintsX[i][j];
						}
					}
				}
				for (i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for (j = 0; j < hintsY[i].length; j++) {
						if (hintsY[i][j] < 0) {
							hintsYText[i][j] = '<em>' + Math.abs(hintsY[i][j]) + '</em>';
						} else {
							hintsYText[i][j] = hintsY[i][j];
						}
					}
				}
			} else {
				for (i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for (j = 0; j < hintsX[i].length; j++) {
						hintsXText[i][j] = Math.abs(hintsX[i][j]);
					}
				}
				for (i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for (j = 0; j < hintsY[i].length; j++) {
						hintsYText[i][j] = Math.abs(hintsY[i][j]);
					}
				}
			}

			let html = '<table>';
			html += '<tr><td class="key"></td>';
			for (i = 0; i < state[0].length; i++) {
				html += '<td class="key top">' + hintsYText[i].join('<br/>') + '</td>';
			}
			html += '</tr>';
			for (i = 0; i < state.length; i++) {
				html += '<tr><td class="key left">' + hintsXText[i].join('&nbsp;') + '</td>';
				for (j = 0; j < state[0].length; j++) {
					html += '<td class="cell s' + Math.abs(state[i][j]) + '" data-x="' + i + '" data-y="' + j + '">';
					if (state[i][j] < 0) {
						html += 'X'; //&#9785;
					}
					html += '</td>';
				}
				html += '</tr>';
			}
			html += '</table>';

			puzzleObj.html(html);

			const side = (600 - (state[0].length * 5)) / state[0].length;
			$('#puzzle td.cell').css({
				width: side,
				height: side,
				fontSize: Math.ceil(200 / state[0].length)
			});
		}
	});

	new PuzzleView({model: new PuzzleModel()});

});

function localStorageSupport() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}
