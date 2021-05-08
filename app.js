const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser= require("body-parser");
var mysql=require('mysql');


var PORT=process.env.PORT||3000;
const app = express();

app.engine("handlebars", exphbs());

app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static('public'));  //public folder, use for styling




// cd C:\Program Files\MySQL\MySQL Server 8.0\bin         
// mysql -h testinstance.ct7lrszoc875.us-east-1.rds.amazonaws.com -P 3306 -u admin -p                    
// 


// create table items(barcode_id int auto_increment primary key, item_name varchar(20), img_url varchar(200), department varchar(20), taxable varchar(5), unit_price double, price_unit varchar(5), case_price double , num_lb_in_case double, cases_in_stock int);    
// insert into items (item_name, img_url,department,taxable,unit_price,price_unit,case_price,num_lb_in_case,cases_in_stock) values ('','','Fruit','No',0.60,'Each', 16, 30,15);   

var db = mysql.createConnection({
  host     : 'testinstance.ct7lrszoc875.us-east-1.rds.amazonaws.com',
  user     : 'admin',
  password: 'Ljx756114194',
  port: 3306,
  database: 'mydb'
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


var current_user;
var current_user_id;
var shoppingArr;
var purchase_count;

app.get("/", function(req, res) {
  res.render("login",{title:'LogIn Page', style:'login.css'});
});

// app.get("/", function(req, res) {
//   res.render("graph",{style:'graph.css',script:'graph.js', search_id:'searcher', date:["2020-03-11","2020-04-12", "2020-04-13"], numberA:["100","150","123"]});
// });

app.get("/newUser",function(req,res){
	res.render("signup", {title:'Sign Up Page', style:'signup.css'});
});

app.post('/newAccount',function(req,res){
	var userN=req.body.username;
	var email=req.body.email;
	var pass =req.body.password;
	var street=req.body.street;
	var zipcode=req.body.zipcode;
	var state=req.body.state;
	var phone=req.body.phone;
	
	var checkRepeat=0;

	let p= new Promise((resolve,reject)=>{
		
		db.query("SELECT * FROM customers", function (err, result, fields) {
		    if (err) throw err;
			    result.map((element,index)=>{
		    	
				if(element.username===userN){
					checkRepeat=1;	
					console.log('first, '+checkRepeat);    
				}
			});
			if(checkRepeat===1){
				resolve(checkRepeat);
							
			}else if(checkRepeat===0){
				console.log("not repeat");
				var sql = "INSERT INTO customers (username,email,passowrd, phone) VALUES ('"+ userN+"','"+ email+"','"+pass+"','"+phone+"')";
				// console.log(sql);
				db.query(sql, function (err, result) {
					if (err) throw err;
						console.log("1 record inserted");
				});


				var sql2 ="INSERT INTO address (street_address, state, zipcode)  VALUES ('"+ street+"','"+state+"','"+zipcode+"')";
				db.query(sql2, function (err, result) {
					if (err) throw err;
						console.log("1 record inserted");
				});
				resolve(checkRepeat);
			}
			else{
				reject('Failed');
			}
		});	
	});	
		
	p.then((message)=>{
		console.log(message);
		if(message===1){
			res.render("signup");
		}else{
			res.redirect("/");
		}
	}).catch((message)=>{
		console.log("error");
	});
		
});
app.post("/home",function(req, res){


	var userN=req.body.username;
	var pass =req.body.password;

	if(userN==='Admin' && pass ==="1011"){
		res.redirect('/admin');
	}else{
		var checkUser=0;
		let p= new Promise((resolve,reject)=>{	
			db.query("SELECT * FROM customers", function (err, result, fields) {
				if (err) throw err;
				result.map((element,index)=>{
						    	
					if(element.username=== userN&& element.passowrd===pass){
					   	checkUser=1;	
					   	current_user=userN;
					   	current_user_id=element.cid;
					   	console.log(checkUser);   	    
					}
				});
				if(checkUser===1 || checkUser===0){
					resolve(checkUser);
				}
				else{
					reject('Failed');
				}
			});    
	    });	
	    p.then((message)=>{
			console.log(message);
			if(message===1){
				res.redirect('/listAllItems');
				
			}else{
				res.redirect("/");
			}
		}).catch((message)=>{
			console.log("error");
		});
	}
});
app.get('/listAllItems',function(req,res){
	var items=[];
			let pr= new Promise((resolve,reject)=>{
				db.query("SELECT * FROM items", function (err, result, fields) {
					if (err) throw err;
					result.map((element,index)=>{  	
						items.push(element);
					});
					if(items.length>=1){
						resolve("Success");
					}else{
						reject('Failed');
					}
				
				});    
			});
			pr.then((message1)=>{
				console.log(message1);
				if(message1==="Success"){
					res.render("home",{title:'Home Page', style: 'home.css', username:current_user, items:items});
				}else{
					res.redirect('/');
				}
			}).catch((message)=>{
				console.log("error");
			});
});

app.get("/itemlist/:param2", function(req, res){
	var id=parseInt(req.params.param2);
	var el;
	var outOfStock=false;
	var remain;
	var item_N;
	var unit_in_lb=false;
	let j= new Promise((resolve,reject)=>{	
		db.query("SELECT * FROM items", function (err, result, fields) {
			if (err) throw err;
			result.map((element,index)=>{
				if(id===element.barcode_id){
					el=element;
					if(element.cases_in_stock*element.num_lb_in_case===0)
					{
						outOfStock=true;
					}
					remain = element.num_lb_in_case*element.cases_in_stock+element.remain_not_in_case;

					if(element.price_unit==='lb')
					{
						unit_in_lb=true;
					}
					item_N=element.item_name;
					
				}
			});
			res.render("item",{title:item_N,  style: 'home.css',username:current_user, element:el, outOfStock:outOfStock, remain:remain, unit_in_lb:unit_in_lb});
		});
	});

});

app.post("/add/:param1",function(req,res){
	var itemId=parseInt(req.params.param1);
	var num=parseInt(req.body.add);
	var excessive=false;
	db.query("SELECT * FROM items", function (err, result, fields) {
			if (err) throw err;
			result.map((element,index)=>{
				if(itemId===element.barcode_id){
					if(num>element.num_lb_in_case*element.cases_in_stock){
						 excessive=true;
					}else{
						var sql = "INSERT INTO shoppingcart (cid,barcode_id,quantity) VALUES ('"+ current_user_id+"','"+ itemId+"','"+num+"')";
						console.log(sql);
						db.query(sql, function (err, result) {
							if (err) throw err;
							console.log("1 record inserted");
						});
					}
				}
			});
			res.redirect("/itemlist/"+itemId);
		});

});

app.get("/shoppingcart/:param1",function(req,res){

	var para=parseInt(req.params.param1);
	if(para===1){
		var arr=[];
		var total=0;
		var anwser;
		var single_tax=0;
		var total_tax=0;

		var sql="select cid, barcode_id, b.item_name, quantity, b.unit_price, b.taxable from shoppingcart as a join (select barcode_id as item_id ,item_name, unit_price,taxable from items) as b on b.item_id=barcode_id and cid="+current_user_id;
		db.query(sql, function (err, result, fields) {
			if (err) throw err;
			answer=result;
			
			result.map((element,index)=>{
				var cur_p=element.unit_price*element.quantity;
				single_tax=0;
				arr.push({
					item_name:element.item_name, 
					quantity: element.quantity, 
					unit_price:element.unit_price, 
					current_price: cur_p.toFixed(2)
				});
				
				if(element.taxable==="Yes"){
					single_tax=(element.unit_price*element.quantity*1.08875)-(element.unit_price*element.quantity);
					total_tax+=single_tax;
				}
				total+=((element.unit_price*element.quantity)+single_tax);
			});

			total_tax=total_tax.toFixed(2);
			total=total.toFixed(2);
			
			shoppingArr=arr;
			console.log(arr);
			res.render("shoppingcart",{title:'Shopping Cart',arr:arr,total:total,total_tax:total_tax});
		
		});
	}else{
		res.render("shoppingcart",{title:'Shopping Cart',arr:shoppingArr,total:0,tax:0});
	}

});


app.post("/delete/:name", function(req,res){
	var it_name=req.params.name;
	console.log("yes delete");
	// var sql=
	db.query(" select cid, barcode_id,item_name, quantity from shoppingcart join (select barcode_id as item_id, item_name from items) as b where item_id=barcode_id", function (err, result, fields) {
		    if (err) throw err;
			result.map((element,index)=>{   
				if(element.item_name===it_name){
					var sql= "DELETE FROM shoppingcart WHERE cid="+current_user_id+ " and barcode_id="+ element.barcode_id ;
					console.log(sql);
					db.query(sql, function (err, result) {
							if (err) throw err;
								console.log("1 record updated");
					});
				}
			});
			
		});	
	res.redirect("/shoppingcart/1");
});

app.post("/update/:name", function(req,res){
	var it_name=req.params.name;
	var num = parseFloat(req.body.updateNumber);
	console.log("update, "+num);
	db.query(" select cid, barcode_id,item_name, quantity from shoppingcart join (select barcode_id as item_id, item_name from items) as b where item_id=barcode_id", function (err, result, fields) {
		    if (err) throw err;
			result.map((element,index)=>{   
				if(element.item_name===it_name){
					var sql= "UPDATE shoppingcart SET quantity="+ num+" where barcode_id="+ element.barcode_id +" and cid="+current_user_id+"";
					console.log(sql);
					db.query(sql, function (err, result) {
							if (err) throw err;
								console.log("1 record updated");
					});
				}
			});
			
		});	
	res.redirect("/shoppingcart/1");

});

app.get('/pay',function(req,res){
	res.render("payment");

});

function check(item){
	db.query("SELECT barcode_id,item_name,cases_in_stock,num_lb_in_case, remain_not_in_case FROM items", function (err, result, fields) {
			if (err) throw err;
			result.map((element,index)=>{
				if(item.item_name===element.item_name){
				    var remainInStock=element.cases_in_stock*element.num_lb_in_case+element.remain_not_in_case;
					remainInStock-=item.quantity;
					var result_case= Math.floor(remainInStock/element.num_lb_in_case);
					var result_remain=remainInStock-(result_case*element.num_lb_in_case);
					result_remain=result_remain.toFixed(2);
					console.log(element.item_name+", "+remainInStock+ ", "+result_case+", "+result_remain);

					var sql= "UPDATE items SET remain_not_in_case="+ result_remain+" where item_name='"+ item.item_name +"'";
					db.query(sql, function (err, result) {
						if (err) throw err;
							console.log("1 record updated");
					});
					if(result_case===item.cases_in_stock){

					}else{
						var sql_case= "UPDATE items SET cases_in_stock="+ result_case+" where item_name='"+ item.item_name +"'";
						db.query(sql_case, function (err, result) {
							if (err) throw err;
								console.log("1 record updated");
						});
					}
					// var sql_paid="INSERT INTO paidItems(cid, item,quantity,unit_price) values ("+current_user_id+","+element.barcode_id+","+item.quantity+","+item.unit_price+")";
					
					

					var total_price= item.quantity*item.unit_price;
					
				
						
						
						// console.log("answercount: "+  answercount);
						var sql_purchase_history="INSERT INTO purchase_history(purchase_id , transaction_id) values ("+(++purchase_count)+","+(purchase_count)+")";
						db.query(sql_purchase_history, function (err, result) {
						if (err) throw err;
						
						});

						console.log("purchase_count in check: "+ purchase_count);
						
				

					var sql_transaction=" INSERT INTO transaction (cid ,total_price) values ("+current_user_id+","+total_price+")";

					db.query(sql_transaction, function (err, result) {
						if (err) throw err;
						
					});

					var sql_purchase="INSERT INTO purchase (barcode_id,quantity) values ("+element.barcode_id+","+item.quantity+")";
					db.query(sql_purchase, function (err, result) {
						if (err) throw err;
						
					});

					

					

					var sql_delete_item_sc="DELETE FROM shoppingcart WHERE cid="+current_user_id+" and barcode_id="+element.barcode_id;
					
					db.query(sql_delete_item_sc, function (err, result) {
						if (err) throw err;
						console.log(sql_delete_item_sc);
						console.log("1 record deleted");
					});

					
				}
			});
		});
	
}
app.get('/finish',function(req,res){
	var count= "select count(*) as an from purchase_history";
	db.query(count, function (err, result) {
		if (err) throw err;

						
		result.map((item,pos)=>{
							
			purchase_count=item.an;
			console.log("purchase_count: "+ purchase_count);
							
		});
	});

	shoppingArr.map((item,pos)=>{
		check(item);
	});
	shoppingArr=[];	

	res.redirect('/shoppingcart/0');
		
});

app.get('/admin',function(req,res){
	var data=[];
	let p= new Promise((resolve,reject)=>{
		db.query("SELECT * FROM items", function (err, result, fields) {
			if (err) throw err;
			result.map((element,index)=>{  	
				data.push(element);
			});
			if(data.length>0){
				resolve("Success");				
			}
			else{
				reject('Failed');
			}
						
		});   
	});
	p.then((message)=>{
		res.render("admin",{data:data});
	}).catch((message)=>{
		console.log("error");
	});	
});

app.post("/companyAdd/:id", function(req,res){
	var item_id=parseInt(req.params.id);
	var addNum= parseInt(req.body.addCases);
	var date = req.body.dateImported;

	db.query("select barcode_id, item_name, cases_in_stock from items", function (err, result, fields) {
		    if (err) throw err;
			result.map((element,index)=>{   
				if(element.barcode_id===item_id){
					addNum= addNum+ element.cases_in_stock;
					
					var sql= "UPDATE items SET cases_in_stock="+ addNum+" where barcode_id="+ item_id ;
					// console.log(sql);
					db.query(sql, function (err, result) {
						if (err) throw err;
						console.log("1 record updated");
					});

					// var sql_date= "UPDATE seller_company_information set import_date= '"+date +"' where barcode_id="+item_id;
					// console.log(sql_date);
					// db.query(sql_date, function (err, result) {
					// 	if (err) throw err;
					// 	console.log("1 record updated");
					// });
				}
			});
			
	});	
	res.redirect("/r");

});

app.get("/r",function(req,res){
	res.redirect("/admin");
});

app.get("/read/:id", function(req,res){
	var item_id=parseInt(req.params.id);
	var sellerData;

	    var sql= "select item_name, items.barcode_id,item_company_name, item_company_phone from items join item_company_key on items.barcode_id=item_company_key.barcode_id join company on company.company_id=item_company_key.company_id";
		db.query(sql, function (err, result, fields) {
			    if (err) throw err;
				result.map((element,index)=>{   

					if(element.barcode_id===item_id){
						sellerData=element;
					}
				});

				res.render("moreinfo",{data:sellerData});
						
		});   

});

app.post("/graph/:id", function(req,res){
	var item_id=parseInt(req.params.id);
	var startDate = req.body.startDate;
	var endDate =req.body.endDate;

	var dateArr="";
	var numArr="";

	let p= new Promise((resolve,reject)=>{
		
		var sql = "select c.barcode_id as item, sum(c.quantity) as sum, c.date from (select barcode_id, quantity, DATE_FORMAT(payment_date, '%Y-%m-%d') as date from transaction join purchase_history on transaction.transaction_id = purchase_history.transaction_id join purchase on purchase.purchase_id = purchase_history.purchase_id and barcode_id=" +item_id +" and (transaction.payment_date BETWEEN '"+startDate+"' AND '"+endDate+"')) as c group by c.date";

		// var sql = "select c.barcode_id as item, sum(c.quantity) as sum, c.date from (select purchase.barcode_id, purchase.quantity, DATE_FORMAT(transaction.payment_date, '%Y-%m-%d') as date from purchase join transaction on purchase.purchase_id=transaction.purchase_id and barcode_id=" +item_id +" and (transaction.payment_date BETWEEN '"+startDate+"' AND '"+endDate+"')) as c group by c.date";
		console.log(sql);
		// var sql= "select b.item, sum(b.quantity) as sum, b.date as date from (SELECT item, quantity, DATE_FORMAT(paid_time, "+"'%Y-%m-%d'"+") as date FROM paidItems where item="+item_id+" and (paid_time BETWEEN '"+startDate+"' AND '"+endDate+"')) as b group by b.date";
		// var sql= "select b.item, sum(b.quantity) as sum, b.date as date from (SELECT item, quantity, DATE_FORMAT(paid_time, "+"'%Y-%m-%d'"+") as date FROM paidItems where item="+item_id+") as b group by b.date";
		db.query(sql, function (err, result, fields) {
			if (err) throw err;
			result.map((element,index)=>{   
				dateArr=dateArr+element.date +",";
				numArr=numArr+element.sum+",";
				console.log("index: "+index +" "+dateArr);
				console.log("index: "+index +" "+numArr);

			});

			if(dateArr.length>0){
				resolve("Success");				
			}
			else{
				reject('Failed');
			}
						
		});   
	});

	p.then((message)=>{
		console.log(dateArr);
		console.log(numArr);
		res.render("graph",{style:'graph.css',script:'graph.js', search_id:'searcher', numberA:numArr, date:dateArr});
		// res.render("graph",{dateArr:dateArr, numArr:numArr});
		// res.render("graph",{dateArr:dateArr, numArr:numArr, script:'graph.js', numArr:numArr, dateArr:dateArr});
	}).catch((message)=>{
		console.log("error");
	});
	
});

app.post("/monthgraph/:id", function(req,res){
	var item_id=parseInt(req.params.id);

	var dateArr="";
	var numArr="";

	let p= new Promise((resolve,reject)=>{
		
		var sql= "select c.barcode_id as item, sum(c.quantity) as sum, c.date from (select barcode_id, quantity, DATE_FORMAT(payment_date, '%Y-%m') as date from transaction join purchase_history on transaction.transaction_id = purchase_history.transaction_id join purchase on purchase.purchase_id = purchase_history.purchase_id and barcode_id="+item_id+") as c group by c.date";
		// var sql= "select c.barcode_id as item, sum(c.quantity) as sum, c.date from (select purchase.barcode_id, purchase.quantity, DATE_FORMAT(transaction.payment_date, "+"'%Y-%m'"+") as date from purchase join transaction on purchase.purchase_id=transaction.purchase_id and barcode_id="+item_id+") as c group by c.date";
		console.log(sql);
		// var sql= "select b.item, sum(b.quantity) as sum, b.date as date from (SELECT item, quantity, DATE_FORMAT(paid_time, "+"'%Y-%m'"+") as date FROM paidItems where item="+item_id+" ) as b group by b.date";
		// var sql= "select b.item, sum(b.quantity) as sum, b.date as date from (SELECT item, quantity, DATE_FORMAT(paid_time, "+"'%Y-%m-%d'"+") as date FROM paidItems where item="+item_id+") as b group by b.date";
		db.query(sql, function (err, result, fields) {
			if (err) throw err;
			result.map((element,index)=>{   
				dateArr=dateArr+element.date +",";
				numArr=numArr+element.sum+",";
				console.log("index: "+index +" "+dateArr);
				console.log("index: "+index +" "+numArr);

			});

			if(dateArr.length>0){
				resolve("Success");				
			}
			else{
				reject('Failed');
			}
						
		});   
	});

	p.then((message)=>{
		console.log(dateArr);
		console.log(numArr);
		res.render("graph",{style:'graph.css',script:'monthgraph.js', search_id:'searcher', numberA:numArr, date:dateArr});
		// res.render("graph",{dateArr:dateArr, numArr:numArr});
		// res.render("graph",{dateArr:dateArr, numArr:numArr, script:'graph.js', numArr:numArr, dateArr:dateArr});
	}).catch((message)=>{
		console.log("error");
	});
	
});

app.get("/addnewItems", function(req,res){
	res.render("addnew");
});

app.listen(PORT,function(){
	console.log("Server is running");
});



