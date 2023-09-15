const ejs = require("ejs");
const http = require("http");
const fs = require("fs");

const bodyParser = require("body-parser");
const express = require("express");

const path = require('path');

class Grocery {
  #name;
  #price;
  #id;

  constructor(id, name, price) {
    this.#id = id;
    this.#name = name;
    this.#price = price;
  }

  getName() {
    return this.#name;
  }

  getPrice() {
    return this.#price;
  }

  getItemData() {
    return {
      name: this.#name,
      price: this.#price,
    };
  }

getId() {
      return this.#id;
    }

}

const server = express();

server.set("views", require("path").resolve(__dirname, "templates"));
server.set("view engine", "ejs");
server.use(require("body-parser").urlencoded({extended:false}));

process.stdin.on('readable', function() {
});

const data = fs.readFileSync(process.argv[2], "utf8");
const jsonData = JSON.parse(data);
let items = jsonData.itemsList.map((itemData, index) => new Grocery(index, itemData.name, itemData.cost));

server.get("/", (request, res) => {
  res.render("index");
});

server.get("/catalog", (request, res) => {
    let itemsTable = "<table border='1'><tr><th>Item</th><th>Cost</th></tr>";
    try {
      items.forEach((item) => {
        itemsTable += `<tr><td>${item.getName()}</td><td>${item.getPrice().toFixed(2)}</td></tr>`;
      });
    } catch (error) { // debugging purposes
      console.log("Error: ", error);
      itemsTable += "<tr><td colspan='2'>Error displaying items</td></tr>";
    }
    itemsTable += "</table>";
    res.render("displayItems", { itemsTable });
  });
  


server.get("/order", (request, res) => {
    let itemsOptions = items.map((item) => `<option value="${item.getName()}">${item.getName()}</option>`).join("");
    res.render("placeOrder", { items: itemsOptions });
  });
  
server.post("/order", (request, res) => {
  const itemsObj = {};
  items.forEach(item => {
    itemsObj[item.getName()] = item.getPrice();
  });

  let tab = "<table border ='1'><tr><td><strong>Item</strong></td><td><strong>Cost</strong></td></tr>";
  let totalCost = 0;
  const itemsSelected = Array.isArray(request.body.itemsSelected) ? request.body.itemsSelected : [request.body.itemsSelected];
  itemsSelected.forEach((itemName) => {
    totalCost += itemsObj[itemName];
    tab += `<tr><td> ${itemName} </td><td> ${itemsObj[itemName].toFixed(2)} </td></tr>`;
  });
  tab += `<tr><td>Total Cost: </td><td> ${(totalCost).toFixed(2)} </td></tr>`;
  tab += "</table>";

  const orderPost = {
    name: request.body.name,
    email: request.body.email,
    delivery: request.body.delivery,
    orderTable: tab
  };
  res.render("orderConfirmation", orderPost);
});
  
const website = http.createServer(server);
website.listen(5000);
console.log("Web server started and running at http://localhost:5000");
console.log("Type itemsList or stop to shutdown the server: ");





