var jquery = require('jquery');
var vo = require('vo'); 
var Nightmare = require('nightmare');
const ObjectsToCsv = require('objects-to-csv');

vo(run)(function(err, result) {                                                                                                                                                                            
	if (err) throw err;                                                                                                                                                                                    
});                                                                                                                                                                                                        


function* run() {   
	var nightmare = Nightmare(),
		MAX_PAGE = 10,                                                                                                                                                                                     
		currentPage = 0,
		nextExists = true,
		houses = [];

	yield nightmare
		.goto('https://www.realtor.com/realestateandhomes-search/53217')
		.wait('body')
    
	nextExists = yield nightmare.visible('.next');   

	while (nextExists && currentPage < MAX_PAGE) {      
		houses.push(yield nightmare
		.evaluate(function () {
			var houses = [];
    	
			$("div.srp-item-body").each(function (i, ele) {
				var data = {};
				data["Price"] = ele.children[1].innerText;
				data["Address"] = ele.children[2].innerText;
				var str = ele.children[5].innerText;
				var desc = str.split("\n");
				isNaN(desc[0]) == false ? data["Beds"] = desc[0] : data["Beds"] = 'n/a';
				data["Bath"] = desc[2];
				data["Sq. Feet"] = desc[4];
				data["Lot Size (acre)"] = desc[6];
				houses.push(data);
			});
			return houses;
		}));

		yield nightmare                                                                                                                                                                                    
            .click('.next')                                                                                                                                                                                
            .wait('body')                                                                                                                                                                                  

		currentPage++;                                                                                                                                                                                     
		nextExists = yield nightmare.visible('.next');      
	}
	var flat = [].concat.apply([], houses);
	// Function must be asynchronous:
	(async() =>{
		let csv = new ObjectsToCsv(flat);
 
		// Save to file:
		await csv.toDisk('./data.csv');
 
		// Return the CSV file as string:
		console.log(await csv.toString());
	})();
	yield nightmare.end();
}

