const lehavaData = require('../config/lehavaData')
const hiData = require('../config/hichat.credentials')
const validator = require('../validators/mainValidator')
const arraysearch = require('../modules/arraysearch')
const headerValidators = require('../routes/api.router')
const Call = require('../modules/newCall');
const hichatTools = require('../modules/hichat.tools')
const {
    json
} = require('express')

module.exports = (app) => {
  // Header Values Middleware-Validator
  app.use("/caisd-rest", headerValidators);

  // get access key by POST request (access key is valid for one week only)
  app.post("/caisd-rest/rest_access", (req, res) => {
    if (validator.accessKeyValidator(req)) {
      res.json(lehavaData.restaccess);
    } else {
      res.status(400).send({
        error: "Body is not set properly",
      });
    }
  });
  // app.use(async (req, res, next) => {await delay(5000);next();})
  // GET all exceptions
  app.get("/caisd-rest/z_pcat_to_network", (req, res) =>
    res.json(lehavaData.exceptions.incidents)
  );
  app.get("/caisd-rest/z_chgcat_to_network", (req, res) =>
    res.json(lehavaData.exceptions.requests)
  );

  // GET all networks details
  app.get("/caisd-rest/nr", (req, res) => {
    // if (validator.allNetworksWCValidator(req)) {
    res.json(lehavaData.all_networks);
    // } else {
    //     res.status(400).send({
    //         error: "WC Parameter not set properly"
    //     });
    // }
  });  

    // GET all locations details
    app.get('/caisd-rest/loc', (req, res) => {
        // if (validator.allLocationsWCValidator(req)) {
            res.json(lehavaData.all_locations);
        // } else {
            // res.status(400).send({
                // error: "WC Parameter not set properly"
            // });
        })
    

     // GET all location by Organization uuid
     app.get('/caisd-rest/org', (req, res) => {
         console.log('organization location:', lehavaData.organizations)
         res.json(lehavaData.organizations);
     });

  // GET all network's services by network's unique id
  app.get("/caisd-rest/z_networks_to_service", (req, res) => {
    if (validator.servicesValidator(req)) {
      res.json(lehavaData.services[req.query.WC.split("'")[1] - 1]);
    } else {
      res.status(400).send({
        error: "Parameters not sent properly",
      });
    }
  });

  // GET all service PROBLEM categories by service's unique id
  app.get("/caisd-rest/pcat", (req, res) => {
    if (validator.categoriesValidator(req)) {
      res.json(lehavaData.problemCategories[req.query.WC.split("'")[1] - 1]);
    } else {
      try {
        if (req.query.WC.startsWith("id=1")) {
          res.status(200).json({
            collection_pcat: {
              pcat: {
                "@id": "1",
                description:
                  "http://www.netflix.com/browse",
              },
            },
          });
        } else {
          res.status(200).json({
            collection_pcat: {
              "@COUNT": "0",
            },
          });
        }
      } catch (e) {
        res.status(400).send({
          error: "No WC parameter on GET request",
        });
      }
    }
  });

  // GET all service REQUEST categories by service's unique id
  app.get("/caisd-rest/chgcat", (req, res) => {
    if (validator.categoriesValidator(req)) {
      res.json(lehavaData.requestsCategories[req.query.WC.split("'")[1] - 1]);
    } else {
      try {
        if (req.query.WC.startsWith("id=1")) {
          res.status(200).json({
            collection_chgcat: {
              chgcat: {
                "@id": "1",
                description:
                  "http://www.netflix.com/browse",
              },
            },
          });
        } else {
          res.status(200).json({
            collection_pcat: {
              "@COUNT": "0",
            },
          });
        }
      } catch (e) {
        res.status(400).send({
          error: "No WC parameter on GET request",
        });
      }
    }
  });

  // Lehava | GET user Unique id by T username
  // Lehava | GET Supporters List
  app.get('/caisd-rest/cnt', async (req, res) => {
    if (validator.isOrganization(req)) {
        console.log('organizations:', lehavaData.users[0].data);
        res.json(lehavaData.users[0].data);
    }
    if (validator.isUserSupporter(req)) {
        res.json(lehavaData.supporters);
    } else {
        if (validator.userExistsValidator(req)) {
            res.json(lehavaData.users[arraysearch("T", req.query.WC.split("'")[1], lehavaData.users)].data);
        } else {
            res.status(400).send({
                error: `User:${req.query.WC.split("'")[1]} Doesn't Exist`
            });
        }
    }
    });

  // GET user active and non-active calls by user unique id
  app.get("/caisd-rest/cr", (req, res) => {
    console.log(req.query.WC);
    if (validator.userCallsHeaderValidator(req)) {
      if (req.query.WC.startsWith("category")) {
        const pcatId = String(
          parseInt(req.query.WC.split(":").pop().split("'")[0])
        );
        const pcatIdValue =
          lehavaData.categoryWideProblems[
            arraysearch("categoryId", pcatId, lehavaData.categoryWideProblems)
          ];
        console.log(pcatId);
        console.log(pcatIdValue);
        if (pcatIdValue) {
          res.json(lehavaData.categoryWideProblems[pcatId].data);
        } else {
          res.json(lehavaData.categoryWideProblemsEmpty);
        }
      } else {
        if (
          lehavaData.nonactivecalls[
            arraysearch(
              "userUniqueId",
              req.query.WC.split("'")[1],
              lehavaData.nonactivecalls
            )
          ]
        ) {
          if (req.query.WC.split("active=")[1] == 0) {
            // Respond Non active calls
            res.json(
              lehavaData.nonactivecalls[
                arraysearch(
                  "userUniqueId",
                  req.query.WC.split("'")[1],
                  lehavaData.nonactivecalls
                )
              ].indata
            );
          } else if (req.query.WC.split("active=")[1] == 1) {
            // Respond Active calls
            res.json(
              lehavaData.activecalls[
                arraysearch(
                  "userUniqueId",
                  req.query.WC.split("'")[1],
                  lehavaData.activecalls
                )
              ].indata
            );
          }
        } else {
          res.status(400).send({
            error: "No Such User",
          });
        }
      }
    } else if (validator.updatesValidator(req)) {
      res.send(lehavaData.updates);
    } else {
      res.status(400).send({
        error: "Header is not sent in your request",
      });
    }
  });

  app.get("/caisd-rest/in", (req, res) => {
    if (validator.userCallsHeaderValidator(req)) {
      if (req.query.WC.startsWith("category")) {
        const pcatId = String(
          parseInt(req.query.WC.split(":").pop().split("'")[0])
        );
        const pcatIdValue =
          lehavaData.categoryWideProblems[
            arraysearch("categoryId", pcatId, lehavaData.categoryWideProblems)
          ];
        let sendMsg = {};
        if (pcatIdValue) {
          sendMsg = lehavaData.categoryWideProblems[pcatId].data;
        } else {
          sendMsg = lehavaData.categoryWideProblemsEmpty;
        }
        res.json(sendMsg);
      } else {
        if (
          lehavaData.nonactivecalls[
            arraysearch(
              "userUniqueId",
              req.query.WC.split("'")[1],
              lehavaData.nonactivecalls
            )
          ]
        ) {
          if (req.query.WC.split("active=")[1] == 0) {
            // Respond Non active calls
            const sendMsg =
              lehavaData.nonactivecalls[
                arraysearch(
                  "userUniqueId",
                  req.query.WC.split("'")[1],
                  lehavaData.nonactivecalls
                )
              ].indata;
            res.json(sendMsg);
          } else if (req.query.WC.split("active=")[1] == 1) {
            // Respond Active calls
            const sendMsg =
              lehavaData.activecalls[
                arraysearch(
                  "userUniqueId",
                  req.query.WC.split("'")[1],
                  lehavaData.activecalls
                )
              ].indata;
            res.json(sendMsg);
          }
        } else {
          res.status(400).send({
            error: "No Such User",
          });
        }
      }
    } else if (validator.updatesValidator(req)) {
      console.log("elseee");
      let sendMsg = lehavaData.updates;
      res.send(sendMsg);
    } else {
      res.status(400).send({
        error: "Header is not sent in your request",
      });
    }
  });

  app.get("/caisd-rest/chg", (req, res) => {
    console.log(req.query.WC);
    if (validator.userCallsHeaderValidator(req)) {
      if (
        lehavaData.nonactivecalls[
          arraysearch(
            "userUniqueId",
            req.query.WC.split("'")[1],
            lehavaData.nonactivecalls
          )
        ]
      ) {
        if (req.query.WC.split("active=")[1] == 0) {
          // Respond Non active calls
          res.json(
            lehavaData.nonactivecalls[
              arraysearch(
                "userUniqueId",
                req.query.WC.split("'")[1],
                lehavaData.nonactivecalls
              )
            ].chgdata
          );
        } else if (req.query.WC.split("active=")[1] == 1) {
          // Respond Active calls
          res.json(
            lehavaData.activecalls[
              arraysearch(
                "userUniqueId",
                req.query.WC.split("'")[1],
                lehavaData.activecalls
              )
            ].chgdata
          );
        }
      } else {
        res.status(400).send({
          error: "No Such User",
        });
      }
    } else if (validator.updatesValidator(req)) {
      res.send(lehavaData.updates);
    } else {
      res.status(400).send({
        error: "Header is not sent in your request",
      });
    }
  });

  // POSTing a new request and response back the new lehava request id
  app.post("/caisd-rest/cr", (req, res) => {
    if (validator.typeCheck(req) === "cr") {
      const userId = req.body.cr.customer["@id"].split("'")[1];
      const category = req.body.cr.description.split("\n")[0];
      const description = req.body.cr.description.split("\n")[1];

      const newCall = new Call(userId, category, description);
      newCall.save();
      res.send(lehavaData.inRequests);
      lehavaData.inRequests.in["@COMMON_NAME"] += 1;
    } else if (validator.typeCheck(req) === "chg") {
      const userId = req.body.chg.requestor["@id"].split("'")[1];
      const category = req.body.chg.description.split("\n")[0];
      const description = req.body.chg.description.split("\n")[1];

      const newCall = new Call(userId, category, description);
      newCall.save();
      res.send(lehavaData.chgRequests);
      lehavaData.chgRequests.chg["@COMMON_NAME"] += 1;
    } else {
      res.status(400).send({
        error: "Bad Parameters",
      });
    }
  });

  // HiChat | Server Response Mock For GET HichatUrl
  app.get("/hichat/exampleurl", (req, res) => {
    res.send({
      url:
        "https://www.ynet.co.il/Ext/App/TalkBack/CdaViewOpenTalkBack/0,11382,L-3190779-3,00.html",
    });
  });

  // HiChat | Base route => Checking if content-type = application/json
  app.use("/api/v1", (req, res, next) => {
    hichatTools.contentTypeCheck(req, res, next);
  });

  // HiChat | Login credentials checker
  app.post("/api/v1/login", (req, res) => {
    hichatTools.loginAuth(req, res);
  });

  // HiChat | Create a new group
  app.post("/api/v1/groups.create", (req, res) => {
    hichatTools.groupsCreate(req, res);
  });

  // HiChat | Add members to group
  app.post("/api/v1/groups.invite", (req, res) => {
    hichatTools.groupsInvite(req, res);
  });
};
