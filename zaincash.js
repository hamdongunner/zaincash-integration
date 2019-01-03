/*
 * The index file that will be called to creat a payment request
 * @Author Hamdon
  */

//  Dependencies
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const request = require('request');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

//  Middleware to get the json from the request
app.use(express.json());

//  If the environment if it was on production or on testing mode
const initUrl = 'https://test.zaincash.iq/transaction/init';
const requestUrl = 'https://test.zaincash.iq/transaction/pay?id=';

if(process.env.PRODUCTION === "true"){
  initUrl = 'https://api.zaincash.iq/transaction/init';
  requestUrl = 'https://api.zaincash.iq/transaction/pay?id=';
}

//  Set the serviceType (Any text you like such as your website name)
const serviceType = "Hamdon Website";

//after a successful or failed order, the user will redirect to this url
const redirectUrl = 'https://example.com/redirect';

/* ------------------------------------------------------------------------------
Notes about redirectionUrl:
in this url, the api will add a new parameter (token) to its end like:
https://example.com/redirect?token=XXXXXXXXXXXXXX
------------------------------------------------------------------------------  */


//  Handeling the payment request
app.post('/pay', (req, res) => {
  //  Set the amount to 250 if there is no amount in the request (For testing)
  //  it has to be more that 250 IQD
  const amount = req.body.amount ? req.body.amount : 250;

  //  Set an order id (This is usualy should be the order id in your sys DB)
  const orderId = "YOUR-ORDER-ID-FROM-YOUR-DB";

  //  Set the token expire time
  const time = Date.now();

  //  Building the transaction data to be encoded in a JWT token
  const data = {
    'amount': amount,
    'serviceType': serviceType,
    'msisdn': process.env.MSISDN,
    'orderId': orderId,
    'redirectUrl': redirectUrl,
    'iat': time,
    'exp': time + 60 * 60 * 4
  };

  //  Encoding the datd
  const token = jwt.sign(data, process.env.SECRET);

  //  Preparing the payment data to be sent to ZC api
  const postData = {
    'token': token,
    'merchantId': process.env.MERCHANTID,
    'lang': process.env.LANG
  };

  //  Request Option
  const requestOptions = {
    uri: initUrl,
    body: JSON.stringify(postData),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  //  Initilizing a ZC order by sending a request with the tokens
  request(requestOptions, function (error, response) {
    //  Getting the operation id
      const OperationId = JSON.parse(response.body).id;
    //  Redirect the user to ZC payment Page
      res.writeHead(302, {
        'Location': requestUrl + OperationId
      });
      res.end();
        res.send(OperationId);
  });
});


// Starting the server
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
