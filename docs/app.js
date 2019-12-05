/*=== BUDGET CONTROLLER ===*/
var budgetController = (function () { // anonymous function is declared and imediatly called (IIFE).

	var Expense = function(id, description, value) { // We created construction for Expense
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0 ) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
		
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) { // We created construction for Income
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		 data.allItems[type].forEach(function(current){
		 	sum += current.value;
		 });
		 data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return { //these are public functions
		addItem: function(type, des, val) {
			var newItem, ID;

			// [1, 2, 3, 4], next ID = 5
			// [1, 2, 4, 5, 7], next ID = 8
			// ID = lastID + 1

			// Create new ID for the new item
			if (data.allItems[type].length > 0 ) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //allItems[exp][length-1].id
			} else {
				ID = 0;
			}

			// Create new item based on Inc or Exp type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// Push it into our data structure
			data.allItems[type].push(newItem);	// Push adds a new element at the end of the array.

			// Return the element
			return newItem;
		},
		deleteItem: function(type, id) {
			var ids, index;
			//id = 6
			//ids = [1 2 4 6 8];
			//index = 3; (index of id=6);
			var ids = data.allItems[type].map(function(current) {
				return current.id;
			});
			index = ids.indexOf(id);
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function() {
			// Calculate total income and Expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// Calculate the budghet: Income - Expenses
			data.budget = data.totals.inc - data.totals.exp;

			// Calculate the percentage of income that we spent.
			if (data.totals.inc > 0 ) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1; // means nonexistents.
			}

		},
		calculatePercentages: function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
			
		},
		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},
		testing: function() {
			console.log(data);
		}
	};

})();



/*=== USER-INTERFACE CONTROLLER ===*/
var UIController = (function() {

	var DOMstrings = {
		inputType: 	'.add__type',
		inputDescr: '.add__description',
		inputValue: '.add__value',
		inputBtn: 	'.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber  = function(num, type){
		var numSplit, int, dec, type;
		/*
			+ or - before number
			exactly 2 decimal points
			comma separating the thousands
			2310.4567 -> + 2,310.46
			2000 -> + 2,000.00
		*/
		num = Math.abs(num);
		num = num.toFixed(2); // JS auto converts them into OBJ (num) and than we can use their methods

		numSplit = num.split('.');
		int = numSplit[0]; // this is a string, so we have acces to the length property.
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		dec = numSplit[1];
		return (type === 'exp' ? '-' : "+") + ' ' + int + '.' +dec;
	};

	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);		
		}
	};

	return {

		getInput: function() {
			return {// return an obj containing 3 var as properties.
				type: 	document.querySelector(DOMstrings.inputType).value, // Will be either inc(+) or exp(-);
				description: document.querySelector(DOMstrings.inputDescr).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) { // we need obj itself, and the type(inc or exp)
			var html, newHtml, element;
			//Create HTML string with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">x</i></button></div></div></div>';

			} else if (type === 'exp') {
				element = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">x</i></button></div></div></div>';
			}

			//Replace the placeholdertext with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			//Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArray;
			//Select all fields.
			fields = document.querySelectorAll(DOMstrings.inputDescr + ', ' + DOMstrings.inputValue);

			//convert the returned List into an Array.
			fieldsArray = Array.prototype.slice.call(fields);

			//Loop over the array to clear fields
			fieldsArray.forEach(function(current, index, array){
				current.value = "";
			});

			// Add focus to the first field
			fieldsArray[0].focus();
		},

		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type) ;
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0 ) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percArray) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			//based on the knowledge of callback functions, and passing functions like variables.
			nodeListForEach(fields, function(current, index) {
				if (percArray[index] > 0) {
					current.textContent = percArray[index] + '%';
				} else {
					current.textContent = '---';
				}	
			});
		},

		displayMonth: function() {
			var now, year, month, months;

			var now = new Date();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septembre', 'October', 'Nomvember', 'December']
			var month = now.getMonth();
			var year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changedType: function() {
			var fields = document.querySelectorAll( /* this returns a nodeList, so we cant use forEach method */
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescr + ',' +
				DOMstrings.inputValue);
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();



/*=== GLOBAL APP CONTROLLER ===*/
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {

		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on UI
		UICtrl.displayBudget(budget);

	};

	var ctrlAddItem = function() {
		var input, newItem;

		// 1. Get the fieled input data
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {

			// 2. Add the Items to the budgetController
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add newItem to UserInterface
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fileds
			UICtrl.clearFields();

			// 5. Calculate and Update budget
			updateBudget();

			// 6. caluclate/Update percentages
			updatePercentages();
		}
	};

	var updatePercentages = function(){
		// 1. Calculate th percentages
		budgetCtrl.calculatePercentages();
		// 2. Read from budget controller
		var percentages = budgetCtrl.getPercentages();
		// 3. Update the UI with new percentages
		UICtrl.displayPercentages(percentages);
	};

	var ctrlDeleteItem = function(event) { //we need this obj event, to find out what the target element is.
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			splitID = itemID.split('-'); //split the itemID string where is a '-';
			// splitID = ["type", "ID"];
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. Delete item from DataStructure
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete the item form UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and Show the new budget
			updateBudget();

			// 4. caluclate/Update percentages
			updatePercentages();
		}
	};


	return { // since we need this Init function to be public, we create an object and return it.
		init: function() {
			console.log('Application has started');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	}

})(budgetController, UIController);

controller.init();
