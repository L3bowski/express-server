document.addEventListener("DOMContentLoaded", function(event) { 

	var patternRows;
	var patternColumns;
	var pattern;
	var zoomOut;
	var fractalRows;
	var fractalColumns;
	var fractal;

	function fractalDrawerHandler() {
		updatePattern();
		
		zoomOut = parseInt(document.getElementById('zoom-out').value);
		fractalRows = Math.pow(patternRows, zoomOut);
		fractalColumns = Math.pow(patternColumns, zoomOut);

		var fractalWidth = document.getElementById('fractal-picture').clientWidth;
		var piecePixelSize = fractalWidth / fractalColumns;
		var piecePercentageSize = Math.floor(piecePixelSize * 100 * 100 / fractalWidth) / 100;

		var fractal = '';
		for(var i = 0; i < fractalRows; ++i) {			
			for(var j= 0; j < fractalColumns; ++j) {
				var positionValue = fractalPosition(i, j);
				fractal += '<span class="piece ' + (positionValue ? 'colorful' : '') + '" style="width: ' + piecePercentageSize
				 + '%; height:' + piecePercentageSize + '%;"></span>';
			}
			fractal += '<br />';
		}
		document.getElementById('fractal-picture').innerHTML = fractal;	
	}

	function fractalPosition(currentRow, currentColumn) {
		var currentFractal = {
			rowsNumber: fractalRows,
			columnsNumber: fractalColumns,
			correspondingRow: currentRow,
			correspondingColumn: currentColumn
		};
		var nextFractal = {};
		var iterationsNumber = zoomOut;
		var result = iterationsNumber > 0;
		    
		while (result && iterationsNumber > 0) {

			nextFractal.rowsNumber = currentFractal.rowsNumber / patternRows;
			nextFractal.correspondingRow = currentFractal.correspondingRow % nextFractal.rowsNumber;

			nextFractal.columnsNumber = currentFractal.columnsNumber / patternColumns;
			nextFractal.correspondingColumn = currentFractal.correspondingColumn % nextFractal.columnsNumber;

			var correspondingPatternRow = Math.floor(currentFractal.correspondingRow / nextFractal.rowsNumber);
			var correspondingPatternColumn = Math.floor(currentFractal.correspondingColumn / nextFractal.columnsNumber);
			result = pattern[correspondingPatternRow][correspondingPatternColumn];

			--iterationsNumber;
			currentFractal.rowsNumber = nextFractal.rowsNumber;
			currentFractal.columnsNumber = nextFractal.columnsNumber;
			currentFractal.correspondingRow = nextFractal.correspondingRow;
			currentFractal.correspondingColumn = nextFractal.correspondingColumn;
		}

		return result;
	}

	function gridDrawerHandler() {
		patternRows = parseInt(document.getElementById('rows-number').value);
		patternColumns = parseInt(document.getElementById('columns-number').value);

		var grid = '';
		for(var i = 0; i < patternRows; ++i) {
			for(var j= 0; j < patternColumns; ++j) {
				grid += '<input type="checkbox" data-row="' + i + '"" data-column="' + j + '" />';
			}
			grid += '<br />';
		}
		document.getElementById('pattern').innerHTML = grid;
	};

	function updatePattern() {
		pattern = [];
		for(var i = 0; i < patternRows; ++i) {
			pattern.push([]);
			var currentRow = pattern[pattern.length - 1];
			for(var j= 0; j < patternColumns; ++j) {
				currentRow.push(document.querySelector('#pattern input[data-row="' + i + '"][data-column="' + j + '"]').checked);
			}
		}
	}

	document.getElementById('grid-drawer').addEventListener('click', gridDrawerHandler);
	document.getElementById('fractal-drawer').addEventListener('click', fractalDrawerHandler);
});
