var _ = require('underscore');
var moment = require('moment');
exports.index = function(req, res) {
    res.render('sphere/index', {});
};
exports.idofsphere = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var name = user.get('name');
          var useremail = user.get("email");
          var sphereObjectID = req.params.id;
          var accesstoken = user.get('fAccessToken');
          var emailsentid = req.query.sentemailid || "";
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
            Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}), //r2
          ]).then(function(r1, r2){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
            var memberisadminofspheres = r2 || [];
              Parse.Promise.when([
                Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken},{}), //r2
                Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r3
                Parse.Cloud.run("aboutsphere",{"sphereID": sphereObjectID}), //r4
                Parse.Cloud.run("hello",{}), //r5
                Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r6
                Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r7
                Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r8
                Parse.Cloud.run("adminactionitemsforspheremergerstochild", {"sphereObjectIDs": [sphereObjectID]}), // r9
                Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r10
                Parse.Cloud.run("ismemberinvitedtosphere", {"sphereObjectID": sphereObjectID, "email": useremail}), //r11
                Parse.Cloud.run("sphereisonlyaparent", {"sphereObjectIDs": memberbelongstospheres, "sphereObjectID": sphereObjectID, "pUserID": pUserID}), //r12
                Parse.Cloud.run("didmemberoptout", {"sphereObjectID": sphereObjectID}), //r13
              ]).then(function(r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13){
                  var userprofileimage = r2 || r10[0]['thumbnailurl'] || null;
                  var numuservotes = r3 || 0;
                  var numadminactionitemsforspherejoiners = r6 || 0;
                  var numadminactionitemsforspheremergers = r8 || 0;
                  var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
                  var numdecisions = r7 || 0;
                  var sphereData = r4[0] || [];
                  var ismemberinvited = r11;
                  var sphereisonlyaparent = r12;
                  var didmemberoptout = r13;
                  var sphereID = req.params.id;
                  var sphereName = sphereData['sphereName'];
                  var sphereDescription = sphereData['sphereDescription'];
                  var spherePrivacy = sphereData['spherePrivacy'];
                  if(spherePrivacy == "open"){
                      var joinselectedpublic = "checked";
                      var joinselectedprivate = "";
                  } else {
                      var joinselectedpublic = "";
                      var joinselectedprivate = "checked";
                  }
                  var sphereElectionCreationOptions = sphereData['sphereElectionCreationOptions'];
                  if(sphereElectionCreationOptions == "open"){
                      var electioncreationoptionsselectedpublic = "checked";
                      var electioncreationoptionsselectedprivate = "";
                  } else {
                      var electioncreationoptionsselectedpublic = "";
                      var electioncreationoptionsselectedprivate = "checked";
                  }
                  var sphereadmins = sphereData['sphereAdmins'];
                  var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                  if(typeof isAdminCheck == "undefined") {
                      var isAdmin = false;
                  } else {
                      var isAdmin = true;
                  }
                  var appID = r5['appID'];
                  var appURL = r5['appURL'];
                  var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                  var joinparentrequestsent = r9 || [];
                  var pageofemails = req.query.pageofemails || 0;
                  if(typeof ismember !== "undefined") {
                      Parse.Promise.when([
                        Parse.Cloud.run("electionsinsphere",{"sphereObjectID": sphereObjectID}), //r8
                        Parse.Cloud.run("spheremembersinsphere", {"sphereObjectID": sphereObjectID}), //r9
                        Parse.Cloud.run("sphereadminsinsphere", {"sphereObjectID": sphereObjectID}), //r10
                        Parse.Cloud.run("sphereadminsinsphereinfo", {"sphereObjectID": sphereObjectID}), //r11
                        Parse.Cloud.run("spherePhotos", {"sphereObjectID": sphereObjectID}), //r12
                        Parse.Cloud.run("profilePicture", {"pageObjectID": sphereObjectID, "pictureClass": "SpherePictures", "pageType": "sphere"}), //r13
                        Parse.Cloud.run("spheremembersinvitedtosphere", {"sphereObjectID": sphereObjectID}), // r14
                        Parse.Cloud.run("spherechildren", {"sphereObjectID": sphereObjectID}), //r15
                        Parse.Cloud.run("sphereparent", {"sphereObjectID": sphereObjectID}), //r16
                        Parse.Cloud.run("spheresiblings", {"sphereObjectID": sphereObjectID}), //r17
                        Parse.Cloud.run("adminemailtomembersinfo", {"sentemailid": emailsentid, "sphereObjectID": sphereObjectID}), //r18
                        Parse.Cloud.run("numberofadminemailstomembersinfo", {"sphereObjectID": sphereObjectID, "page": pageofemails}), //r19
                        Parse.Cloud.run("adminemailstomembersinfo", {"sphereObjectID": sphereObjectID, "page": pageofemails}), //r20
                        Parse.Cloud.run("backgroundPicture", {"pageObjectID": sphereObjectID, "pageType": "sphere"}), //r21
                      ]).then(function(r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19, r20, r21) {
                               var electionItems = r8 || [];
                               var numelections = electionItems.length;
                               var chunksofelections = new Array();
                               var numberofchunks = Math.ceil(numelections / 20);
                               var page = parseInt(req.query.pg) || 0;
                               for(var i=0; i < numberofchunks; i++) {
                                    var firstitemofchunk = (i * 20);
                                    chunksofelections.push(electionItems.slice(firstitemofchunk, (firstitemofchunk + 20)));
                               }
                               if(page < numberofchunks) {
                                 var nextpage = page + 1;
                               } else {
                                 var nextpage = page;
                               }
                               if(page > 0) {
                                 var previousPage = page - 1;
                               } else {
                                 var previouspage = 0;
                               }
                               if(page <= 0) {
                                  var previousdisabled = "disabled";
                               } else {
                                  var previousdisabled = "";
                               }
                               if((page + 1) >= numberofchunks) {
                                 var nextdisabled = "disabled";
                               } else {
                                 var nextdisabled = "";
                               }
                               var displayElections = chunksofelections[page] || "";
                               var spheremembersinsphere = r9 || "";
                               var numspheremembersinsphere = spheremembersinsphere.length;
                               var sphereadminsinsphere = r10 || "";
                               var sphereadminsinsphereinfo = r11 || "";
                               var spherePhotos = r12 || [];
                               if(spherePhotos.length > 0) {
                                   if(spherePhotos.length == 1) {
                                      var sphereProfilePicture = spherePhotos[0]['thumbnailurl'] || "";
                                   } else {
                                      var sphereProfilePicture = r13[0]['thumbnailurl'] || spherePhotos[0]['thumbnailurl'] || "";
                                   }
                               } else {
                                    var sphereProfilePicture = "";   
                               }
                               var spherebackgroundpicture = r21[0]['backgroundpictureurl'] || "../assets/bg3.jpg";
                               if(r21[0]['backgroundpictureurl'] == null){
                                   var spherebackgroundpictureexists = false;
                               } else {
                                   var spherebackgroundpictureexists = true;
                               }
                               var sphereMembersInvitedToSphere = r14 || [];
                               var spherechildren = r15 || [];
                               var sphereparent = r16 || "";
                               var spheresiblings = r17 || [];
                               
                                      res.render('sphere/idofsphere', {
                                       appid: appID,
                                       appurl: appURL,
                                       puserid: pUserID,
                                       fuserid: fUserID,
                                       username: name,
                                       userprofileimageurl: userprofileimage,
                                       numberofelections: numelections,
                                       numberofuservotescast: numuservotes,
                                       numberofadminactionitems: numadminactionitems,
                                       joinselectedpublic: joinselectedpublic,
                                       joinselectedprivate: joinselectedprivate,
                                       electioncreationoptionsselectedpublic: electioncreationoptionsselectedpublic,
                                       electioncreationoptionsselectedprivate: electioncreationoptionsselectedprivate,
                                       numberofdecisions: numdecisions,
                                       numberofchunksofelections: numberofchunks,
                                       electionsinsphere: displayElections,
                                       currentpage: page,
                                       nextdisabled: nextdisabled,
                                       previousdisabled: previousdisabled,
                                       previouspage: previousPage,
                                       nextpage: nextpage,
                                       numberofuserspheres: numuserspheres,
                                       sphereobjectid: sphereObjectID,
                                       sphereid: sphereID,
                                       spherename: sphereName,
                                       spheredescription: sphereDescription,
                                       sphereelectioncreationoptions: sphereElectionCreationOptions,
                                       spheremembersinsphere: spheremembersinsphere,
                                       numspheremembersinsphere: numspheremembersinsphere,
                                       sphereadminsinsphere: sphereadminsinsphere,
                                       sphereadminsinsphereinfo: sphereadminsinsphereinfo,
                                       spheremembersinvitedtosphere: sphereMembersInvitedToSphere,
                                       spherepictureurls: spherePhotos,
                                       spherebackgroundpicture: spherebackgroundpicture,
                                       sphereprofilepicture: sphereProfilePicture,
                                       spherebackgroundpictureexists: spherebackgroundpictureexists,
                                       joinparentrequestsent: joinparentrequestsent,
                                       sphereparent: sphereparent,
                                       spherechildren: spherechildren,
                                       spheresiblings: spheresiblings,
                                       sphereisonlyaparent: sphereisonlyaparent,
                                       didmemberoptout: didmemberoptout,
                                       sentemaildetails: r18,
                                       numberofsentemailsdetails: r19,
                                       sentemailsdetails: r20,
                                       ismemberinvited: ismemberinvited,
                                       isadmin: isAdmin
                                      });
                                 
                            });
                    } else {
                       var SphereJoiners = Parse.Object.extend("SphereJoiners");
                       var spherejoinersquery = new Parse.Query(SphereJoiners);
                       spherejoinersquery.equalTo("requesterpUserID", pUserID);
                       spherejoinersquery.equalTo("sphereObjectID", req.params.id);
                       spherejoinersquery.first().then(function(spherejoiner){
                         if((typeof spherejoiner == "undefined") || (spherejoiner == "")){
                             var requestsent = false;
                         } else {
                             var requestsent = true;
                         }
                           res.render('sphere/notmemberofsphere', {
                           fuserid: fUserID,
                           puserid: pUserID,
                           ismemberinvited: ismemberinvited,
                           username: name,
                           userprofileimageurl: userprofileimage,
                           numberofuserspheres: numuserspheres,
                           numberofuservotescast: numuservotes,
                           numberofadminactionitems: numadminactionitems,
                           numberofdecisions: numdecisions,
                           sphereobjectid: sphereObjectID,
                           sphereid: sphereID,
                           spherename: sphereName,
                           sphereprivacy: spherePrivacy,
                           spheredescription: sphereDescription,
                           didmemberoptout: didmemberoptout,
                           requestsent: requestsent,
                           });
                       });
                    }
                });
            });
        });
    }
};
exports.spheremembers = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var name = user.get('name');
          var useremail = user.get("email");
          var sphereObjectID = req.params.id;
          var accesstoken = user.get('fAccessToken');
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
            Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}), //r2
          ]).then(function(r1, r2){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
            var memberisadminofspheres = r2 || [];
              Parse.Promise.when([
                Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken},{}), //r2
                Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r3
                Parse.Cloud.run("aboutsphere",{"sphereID": sphereObjectID}), //r4
                Parse.Cloud.run("hello",{}), //r5
                Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r6
                Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r7
                Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r8
                Parse.Cloud.run("adminactionitemsforspheremergerstochild", {"sphereObjectIDs": [sphereObjectID]}), // r9
                Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r10
                Parse.Cloud.run("ismemberinvitedtosphere", {"sphereObjectID": sphereObjectID, "email": useremail}), //r11
              ]).then(function(r2, r3, r4, r5, r6, r7, r8, r9, r10, r11){
                  var userprofileimage = r2 || r10[0]['thumbnailurl'] || null;
                  var numuservotes = r3 || 0;
                  var numadminactionitemsforspherejoiners = r6 || 0;
                  var numadminactionitemsforspheremergers = r8 || 0;
                  var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
                  var numdecisions = r7 || 0;
                  var sphereData = r4[0] || [];
                  var ismemberinvited = r11;
                  var sphereID = req.params.id;
                  var sphereName = sphereData['sphereName'];
                  var sphereDescription = sphereData['sphereDescription'];
                  var sphereadmins = sphereData['sphereAdmins'];
                  var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                  if(typeof isAdminCheck !== "undefined") {
                      var isAdmin = true;
                  } else {
                      var isAdmin = false;
                  }
                  var appID = r5['appID'];
                  var appURL = r5['appURL'];
                  var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                  if(typeof ismember !== "undefined") {
                      Parse.Promise.when([
                        Parse.Cloud.run("spheremembersinsphere", {"sphereObjectID": sphereObjectID}), //r9
                        Parse.Cloud.run("sphereadminsinsphere", {"sphereObjectID": sphereObjectID}), //r10
                        Parse.Cloud.run("sphereadminsinsphereinfo", {"sphereObjectID": sphereObjectID}), //r11
                        Parse.Cloud.run("spherePhotos", {"sphereObjectID": sphereObjectID}), //r12
                        Parse.Cloud.run("profilePicture", {"pageObjectID": sphereObjectID, "pictureClass": "SpherePictures", "pageType": "sphere"}), //r13
                        Parse.Cloud.run("spheremembersinvitedtosphere", {"sphereObjectID": sphereObjectID}), // r14
                      ]).then(function(r9, r10, r11, r12, r13, r14) {
                               var spheremembersinsphere = r9 || "";
                               var numspheremembersinsphere = spheremembersinsphere.length;
                               var sphereadminsinsphere = r10 || "";
                               var sphereadminsinsphereinfo = r11 || "";
                               var spherePhotos = r12 || [];
                               if(spherePhotos.length > 0) {
                                   if(spherePhotos.length == 1) {
                                      var sphereProfilePicture = spherePhotos[0]['pictureurl'] || "";
                                   } else {
                                      var sphereProfilePicture = r13[0]['pictureurl'] || spherePhotos[0]['pictureurl'] || "";
                                   }
                               } else {
                                    var sphereProfilePicture = "";   
                               }
                               var sphereMembersInvitedToSphere = r14 || [];
    
                               
                                      res.render('sphere/spheremembers', {
                                       appid: appID,
                                       appurl: appURL,
                                       puserid: pUserID,
                                       fuserid: fUserID,
                                       username: name,
                                       userprofileimageurl: userprofileimage,
                                       numberofuservotescast: numuservotes,
                                       numberofadminactionitems: numadminactionitems,
                                       numberofdecisions: numdecisions,
                                       numberofuserspheres: numuserspheres,
                                       sphereobjectid: sphereObjectID,
                                       sphereid: sphereID,
                                       spherename: sphereName,
                                       spheredescription: sphereDescription,
                                       spheremembersinsphere: spheremembersinsphere,
                                       numspheremembersinsphere: numspheremembersinsphere,
                                       sphereadminsinsphere: sphereadminsinsphere,
                                       sphereadminsinsphereinfo: sphereadminsinsphereinfo,
                                       spheremembersinvitedtosphere: sphereMembersInvitedToSphere,
                                       spherepictureurls: spherePhotos,
                                       sphereprofilepicture: sphereProfilePicture,
                                       ismemberinvited: ismemberinvited,
                                       isadmin: isAdmin
                                      });
                                 
                            });
                    } else {
                        res.redirect("/sphere/"+req.params.id);
                    }
                });
            });
        });
    }
};
exports.spheresendemails = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var name = user.get('name');
          var useremail = user.get("email");
          var sphereObjectID = req.params.id;
          var accesstoken = user.get('fAccessToken');
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
            Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}), //r2
          ]).then(function(r1, r2){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
            var memberisadminofspheres = r2 || [];
              Parse.Promise.when([
                Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken},{}), //r3
                Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r4
                Parse.Cloud.run("aboutsphere",{"sphereID": sphereObjectID}), //r5
                Parse.Cloud.run("hello",{}), //r6
                Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r7
                Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r8
                Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r9
                Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r10
              ]).then(function(r3, r4, r5, r6, r7, r8, r9, r10){
                      var userprofileimage = r3 || r10[0]['thumbnailurl'] || null;
                      var numuservotes = r4 || 0;
                      var numadminactionitemsforspherejoiners = r7 || 0;
                      var numadminactionitemsforspheremergers = r9 || 0;
                      var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
                      var numdecisions = r8 || 0;
                      var sphereData = r5[0] || [];
                      var sphereID = req.params.id;
                      var sphereName = sphereData['sphereName'];
                      var sphereDescription = sphereData['sphereDescription'];
                      var sphereadmins = sphereData['sphereAdmins'];
                      var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                      if(typeof isAdminCheck !== "undefined") {
                          var isAdmin = true;
                      } else {
                          var isAdmin = false;
                      }
                      var appID = r6['appID'];
                      var appURL = r6['appURL'];
                      var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                      if((typeof ismember !== "undefined") && (isAdmin)){
                          res.render('sphere/sendemailstosphere', {
                           appid: appID,
                           appurl: appURL,
                           puserid: pUserID,
                           fuserid: fUserID,
                           username: name,
                           userprofileimageurl: userprofileimage,
                           numberofuservotescast: numuservotes,
                           numberofadminactionitems: numadminactionitems,
                           numberofdecisions: numdecisions,
                           numberofuserspheres: numuserspheres,
                           sphereobjectid: sphereObjectID,
                           sphereid: sphereID,
                           spherename: sphereName,
                           spheredescription: sphereDescription,
                           isadmin: isAdmin
                          });
                    } else {
                       res.redirect("/sphere"+req.params.id);
                    }
                });
            });
        });
    }
};
exports.publicsphere = function(req, res) {
    var sphereObjectID = req.params.id;
    Parse.Promise.when([
      Parse.Cloud.run("aboutsphere",{"sphereID": req.params.id}), //r4
    ]).then(function(r1){
       var sphereData = r1[0];
       var sphereName = sphereData['sphereName'];
       var sphereDescription = sphereData['sphereDescription'];
       res.render('public/publicsphere', {
           sphereobjectid: sphereObjectID,
           spherename: sphereName,
           spheredescription: sphereDescription,
       }); 
    });
};
exports.create = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
            var fUserID = user.get("fUserID");
            var pUserID = user.id;
            Parse.Promise.when([
                Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
            ]).then(function(r1){
               var memberbelongstospheres = r1;
               var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
               if((typeof ismember == "undefined") || (ismember == "undefined")) {
                    res.redirect('sphere/'+req.params.id+'?error=notinsphere');
                    return 0;
               } else {
                   Parse.Promise.when([
                       Parse.Cloud.run("aboutsphere",{"sphereID": req.params.id},{}), //r2
                   ]).then(function(r2){
                       var sphereobject = r2;
                       var sphereID = sphereobject["sphereID"];
                       if((req.body.electionName == "") || (typeof req.body.electionName == "undefined") || (req.body.electionEndDateTime == "") || (typeof req.body.electionEndDateTime == "undefined")) {
                           res.redirect('sphere/'+req.params.id+'?error=missinginfo');
                           return 0;
                       } else {
                                var votesallowed = parseInt(req.body.newElectionVotesAllowed, 10) || null;
                                var totalbudget = parseInt(req.body.newTotalBudget, 10) || null;
                                var rangedef = req.body.newRangeDefinition || null;
                                var voteoreval = req.body.newVoteOrEval || "vote";
                                var Elections = Parse.Object.extend("Elections");
                                var newElection = new Elections();
                                var endDate = new Date(req.body.electionEndDateTime);
                                var nominationsallowed = parseInt(req.body.nominationsAllowed, 10) || null;
                                if((req.body.nomineeLimitedToMembers == "true") || (req.body.nomineeLimitedToMembers == true)){
                                    var nomineelimited = true;   
                                } else {
                                    var nomineelimited = false;
                                }
                                newElection.set("electionVotesAllowed", votesallowed);
                                newElection.set("rangeDefinition", rangedef);
                                newElection.set("totalBudget", totalbudget);
                                newElection.set("voteOrEval", voteoreval);
                                newElection.set("electionType", req.body.electionType);
                                newElection.set("nominationsAllowed", nominationsallowed);
                                newElection.set("nomineeLimitedToMembers", nomineelimited);
                                newElection.set("sphereObjectID", req.params.id);
                                newElection.set("electionName", req.body.electionName);
                                newElection.set("electionDescription", req.body.electionDescription);
                                newElection.set("endDate", endDate);
                                newElection.set("fMemberID", fUserID);
                                newElection.set("pUserID", pUserID);
                                newElection.save().then(function(newelection){
                                    res.redirect("/sphere/"+req.params.id+"/election/"+newelection.id);
                                });
                           }
                   });
                }
            });
        });
    }
};
exports.delete = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
            var fUserID = user.get("fUserID");
            var pUserID = user.id;
            Parse.Promise.when([
                Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
            ]).then(function(r1, r2){
               var memberbelongstospheres = r1;
               var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
               if((typeof ismember == "undefined") || (ismember == "undefined")) {
                    res.redirect('sphere/'+req.params.id+'?error=notinsphere');
                    return 0;
               } else {
                   Parse.Promise.as().then(function(){
                       var Elections = Parse.Object.extend('Elections');
                       var electionsquery = new Parse.Query(Elections);
                       electionsquery.equalTo("objectId", req.body.electionID);
                       return Parse.Promise.when(electionsquery.first().then(function(election){
                           if(election.get("fMemberID") !== fUserID) {
                               res.redirect('sphere/'+req.params.id+'?error=notelectionadmin');
                           } else {
                               return election;
                           }
                       }));
                    }).then(function(election){
                        return election.destroy();
                    }).then(function(election){
                        var electionObjectID = election.id;
                        var ElectionPictures = Parse.Object.extend("ElectionPictures");
                        var electionpicturesquery = new Parse.Query(ElectionPictures);
                        electionpicturesquery.equalTo("pageObjectID", electionObjectID);
                        return Parse.Promise.when(electionpicturesquery.find().then(function(electionpictures){
                            var promises = [];
                            _.each(electionpictures, function(electionpicture){
                               promises.push(electionpicture.destroy()); 
                            });
                            return Parse.Promise.when(promises);
                        }));
                    }).then(function(complete){
                       var Votes = Parse.Object.extend('Votes');
                       var votesquery = new Parse.Query(Votes);
                       votesquery.equalTo("electionObjectID", req.body.electionID);
                       return Parse.Promise.when(votesquery.find().then(function(votes){
                           var promises = [];
                           for(var i=0; i < votes.length; i++) {
                               var vote = votes[i];
                               promises.push(vote.destroy());
                           }
                           return Parse.Promise.when(promises);
                       }));
                    }).then(function(complete){
                       var Nominations = Parse.Object.extend('Nominations');
                       var nominationsquery = new Parse.Query(Nominations);
                       nominationsquery.equalTo("electionID", req.body.electionID);
                       return Parse.Promise.when(nominationsquery.find().then(function(nominations){
                           var promises = [];
                           _.each(nominations, function(nomination){
                               promises.push(nomination.destroy().then(function(nomination){
                                   var Pictures = Parse.Object.extend('Pictures');
                                   var picturesquery = new Parse.Query(Pictures);
                                   picturesquery.equalTo("pageObjectID", nomination.id);
                                   return Parse.Promise.when(picturesquery.first().then(function(picture){
                                       if((typeof picture !== "undefined") && (picture !== null)) {
                                           return picture.destroy();
                                       }
                                    }));
                               }));
                           });
                           return Parse.Promise.when(promises);
                       }));
                    }).then(function(complete){ 
                        res.redirect('sphere/'+req.params.id+'?success=1');
                    });
               }
            });
        });
    }
};
exports.joinsphere = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
            var pUserID = user.id;
            var useremail = user.get("email");
            var sphereObjectID = req.params.id;
            var fUserID = user.get("fUserID");
            var fMemberName = user.get("name");
            var Spheres = Parse.Object.extend("Spheres");
            var spheresquery = new Parse.Query(Spheres);
            spheresquery.equalTo("objectId", sphereObjectID);
            spheresquery.first().then(function(sphere){
                var spheretype = sphere.get("spherePrivacy");
                Parse.Promise.when([
                    Parse.Cloud.run("ismemberinvitedtosphere", {"sphereObjectID": sphereObjectID, "email": useremail}),
                ]).then(function(r1){
                    var ismemberinvitedtosphere = r1;
                    if((ismemberinvitedtosphere ==  true) || (spheretype == "open")){
                        var SphereMembers = Parse.Object.extend("SphereMembers");
                        var spheremembersquery = new Parse.Query(SphereMembers);
                        spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
                        spheremembersquery.equalTo("pUserID", pUserID);
                        spheremembersquery.first().then(function(isamember){
                            if((typeof isamember == "undefined") || (isamember == "") || (isamember == null)) {
                                var Spheres = Parse.Object.extend("Spheres");
                                var spheresquery = new Parse.Query(Spheres);
                                spheresquery.equalTo("objectId", sphereObjectID);
                                spheresquery.first().then(function(sphere){
                                    var sphereadmins= sphere.get("sphereAdmins");
                                    var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                                    if(isAdminCheck !== "undefined") {
                                        var isadmin = true;
                                    } else {
                                        var isadmin = false;
                                    }
                                    var sphereMember = new Parse.Object("SphereMembers");
                                    sphereMember.set("administrator", isadmin);
                                    sphereMember.set("pUserID", pUserID);
                                    sphereMember.set("fMemberID", fUserID);
                                    sphereMember.set("sphereObjectID", req.params.id);
                                    sphereMember.set("name", fMemberName);
                                    sphereMember.save({ 
                                        success: function(spheremember) {
                                           res.redirect("/sphere/"+sphereObjectID); 
                                        }, 
                                        error: function(spheremember, error){
                                           res.redirect("/sphere/"+sphereObjectID+"error=1");  
                                        }
                                    });
                                });
                            } else {
                                res.redirect("/spheres?error=alreadyamember");
                            }
                        });
                    } else {
                        res.redirect("/sphere/"+sphereObjectID+"?error=notinvited");
                    }
                });
            });
      });
    }
};
exports.requestspherejoin = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
            var fUserID = user.get("fUserID");
            var pUserID = user.id;
            var fMemberName = user.get("name");
            var SphereMembers = Parse.Object.extend("SphereMembers");
            var spheremembersquery = new Parse.Query(SphereMembers);
            spheremembersquery.equalTo("objectId", req.params.id);
            spheremembersquery.equalTo("pUserID", pUserID);
            spheremembersquery.first().then(function(isamember){
                if((typeof isamember == "undefined") || (isamember == "")) {
                    var spheres = Parse.Object.extend("Spheres");
                    var spheresquery = new Parse.Query(spheres);
                    spheresquery.equalTo("objectId", req.params.id);
                    spheresquery.first().then(function(sphere){
                        var sphereName = sphere.get("sphereName");
                        var SphereJoinersObject = Parse.Object.extend("SphereJoiners");
                        var sphereJoiner = new SphereJoinersObject();
                        sphereJoiner.set("requesterpUserID", pUserID);
                        sphereJoiner.set("requesterfMemberID", fUserID);
                        sphereJoiner.set("requesterName", fMemberName);
                        sphereJoiner.set("sphereObjectID", req.params.id);
                        sphereJoiner.set("sphereName", sphereName);
                        sphereJoiner.set("actiontaken", false);
                        sphereJoiner.save().then(function(){
                           res.redirect("/admin"); 
                        });
                    });
                }
            })
      });
    }
};
exports.editsphere = function(req, res) {

    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.body.sphereObjectID;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamember");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", req.body.sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                     } else {
                         var sphereName = req.body.sphereName;
                         var sphereDescription = req.body.sphereDescription;
                         var spherePrivacy = req.body.spherePrivacy;
                         var sphereElectionCreationOptions = req.body.sphereElectionCreationOptions;
                         sphere.set("sphereName", sphereName);
                         sphere.set("sphereDescription", sphereDescription);
                         sphere.set("spherePrivacy", spherePrivacy);
                         sphere.set("sphereElectionCreation", sphereElectionCreationOptions);
                         sphere.save().then(function(){
                            res.redirect("/sphere/"+sphereObjectID+"?success=sphereedited"); 
                         });
                     }
                 });
             }
          });
      });
    }
};
exports.removememberfromsphere = function(req, res) {

    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var pUserID = user.id;
          var membertoremove = req.params.mpid;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamember");
             } else {
                 var spheres = Parse.Object.extend("Spheres");
                 var spheresquery = new Parse.Query(spheres);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                    var sphereadminsarray = sphere.get("sphereAdmins");
                    var isAdminCheck = _.find(sphereadminsarray, function(num){ return num == pUserID; });
                    if(isAdminCheck !== "undefined") {
                        if(sphereadminsarray.length == 1) {
                          sphere.set("spherePrivacy", "open");
                          sphere.set("sphereElectionCreation", "open");
                          sphere.save();
                          return true;
                        } else {
                          sphere.remove("sphereAdmins", pUserID);
                          sphere.save();
                          return true;
                        }
                    } else {
                        return true;
                    }
                 }).then(function(){
                    var SphereJoiners = Parse.Object.extend("SphereJoiners");
                    var spherejoinersquery = new Parse.Query(SphereJoiners);
                    spherejoinersquery.equalTo("requesterpUserID", membertoremove);
                    spherejoinersquery.equalTo("sphereObjectID", sphereObjectID);
                    spherejoinersquery.first().then(function(spherejoiner){
                       if((typeof spherejoiner !== "undefined") && (spherejoiner !== "")) {
                            spherejoiner.destroy(); 
                       }
                    });
                 }).then(function(){
                      var SphereMembers = Parse.Object.extend("SphereMembers");
                      var spheremembersquery = new Parse.Query(SphereMembers);
                      spheremembersquery.equalTo("pUserID", membertoremove);
                      spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
                      spheremembersquery.first().then(function(spheremembertoremove){
                         if((typeof spheremember == "undefined") || (spheremember == "")) {
                             res.redirect("/spheres?error=notamember");
                             return false;
                         } else {
                            return spheremembertoremove.destroy();
                         }
                      });
                 }).then(function(){
                      var SphereMembers = Parse.Object.extend("SphereMembers");
                      var spheremembersquery = new Parse.Query(SphereMembers);
                      spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
                      spheremembersquery.first().then(function(memberexists){
                          if((typeof memberexists == "undefined") || (memberexists == "") || (memberexists == null)){
                              var MergeSpheres = Parse.Object.extend("MergeSpheres");
                              var mergedspherequery1 = new Parse.Query(MergeSpheres);
                              mergedspherequery1.equalTo("childSphere", sphereObjectID);
                              var mergedspheresquery2 = new Parse.Query(MergeSpheres);
                              mergedspheresquery2.equalTo("motherSphere", sphereObjectID);
                              var mergedspherequery = Parse.Query.or(mergedspherequery1, mergedspheresquery2);
                              mergedspherequery.find().then(function(mergedspheres){
                                  _.each(mergedspheres, function(mergedsphere){
                                    mergedsphere.destroy();
                                  });
                                  return true;
                              }).then(function(){
                                var MergeRequests = Parse.Object.extend("MergeRequests");
                                var mergerequestsquery1 = new Parse.Query(MergeRequests);
                                mergerequestsquery1.equalTo("childSphere", sphereObjectID);
                                var mergerequestsquery2 = new Parse.Query(MergeRequests);
                                mergerequestsquery2.equalTo("motherSphere", sphereObjectID);
                                var mergerequestsquery = Parse.Query.or(mergerequestsquery1, mergerequestsquery2);
                                mergerequestsquery.find().then(function(mergerequests){
                                    _.each(mergerequests, function(mergerequest){
                                        mergerequest.destroy();
                                    });
                                    return true;
                                }).then(function(){
                                  var Spheres = Parse.Object.extend("Spheres");
                                  var spheresquery = new Parse.Query(Spheres);
                                  spheresquery.equalTo("objectId", sphereObjectID);
                                  spheresquery.first().then(function(sphere){
                                      sphere.destroy().then(function(){
                                         res.redirect("/spheres?success=leftanddeletedsphere"); 
                                      });
                                  });
                                });
                              });
                          } else {
                             res.redirect("/sphere/"+req.params.id+"?success=removedmember");
                             return true;
                          }
                      });
                 });
             }
          });
      });
    }
};
exports.searchmembers = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        Parse.Promise.when([
          Parse.Cloud.run("hello",{}), //r1
          ]).then(function(r1){
            var appAT = r1["appAT"];
            var page_name = req.body.sphere_member_name;
            var sphereObjectID = req.body.sphere_object_id;
            var accesstoken = user.get("fAccessToken");
            Parse.Promise.when([ 
                Parse.Cloud.run("spherememberslookup",{"pagename": page_name, "sphereObjectID": sphereObjectID}) //r2
            ]).then(function(r2){
                var SphereMembers = r2 || [];
                if((typeof SphereMembers !== undefined) && (SphereMembers !== "") && (SphereMembers !== null)) {
                  var suggestions = new Array();
                  _.each(SphereMembers, function(sphereMember){
                    var fMemberID = sphereMember['fMember'] || "";
                    var memberpUserID = sphereMember['pUserID'] || "";
                    var name = sphereMember['name'] || "";
                    var pictureURL = sphereMember['pictureURL'] || "";
                    suggestions.push("<img src='"+pictureURL+"'><br><h4><a href='https://www.facebook.com/"+fMemberID+"' target='_blank'>"+name+"</a></h4><br><form action='/sphere/"+sphereObjectID+"/addadmin/"+memberpUserID+"' method='POST'><input type='submit' class='btn btn-sm btn-primary' value='Add As Admin'></form>");
                  });
                  res.send(suggestions);
                }
            });
        });
    });
};
exports.addadmin = function(req, res) {
    if(Parse.User.current()) {
        Parse.User.current().fetch().then(function(user) {
            var SphereMembers = Parse.Object.extend("SphereMembers");
            var spheremembersquery1 = new Parse.Query(SphereMembers);
            spheremembersquery1.equalTo("sphereObjectID", req.params.id);
            spheremembersquery1.equalTo("pUserID", user.id);
            spheremembersquery1.first().then(function(spheremember){
               if(spheremember.get("administrator") == true) {
                   var spheremembersquery2 = new Parse.Query(SphereMembers);
                   spheremembersquery2.equalTo("sphereObjectID", req.params.id);
                   spheremembersquery2.equalTo("pUserID", req.params.pid);
                   spheremembersquery2.first().then(function(spheremember2){
                      if((typeof spheremember2 !== "undefined") && (spheremember2 !== "")) {
                          var sphereObjectID = spheremember2.get("sphereObjectID");
                          spheremember2.set("administrator", true);
                          spheremember2.save().then(function(){
                              var spheres = Parse.Object.extend("Spheres");
                              var spheresquery = new Parse.Query(spheres);
                              spheresquery.equalTo("objectId", sphereObjectID);
                              spheresquery.first().then(function(sphere){
                                 sphere.addUnique("sphereAdmins", req.params.pid);
                                 sphere.save().then(function(){
                                    res.redirect("/sphere/"+req.params.id+"?success=adminadded");
                                 });
                              });
                          });
                      } else {
                          res.redirect("/sphere/"+req.params.id+"?error=notaspheremember");
                      }
                   });
               } else {
                   res.redirect("/sphere/"+req.params.id+"?error=noadminprivilege");
               } 
            });
        });
    }
};
exports.invitespheremembers = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var pUserID = user.id;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                             var arrayofinvitedmembers = req.body.membersToAddToSphere;
                             Parse.Promise.as().then(function(){
                                 var promises = new Array();
                                 var invitedUsers = [];
                                 _.each(arrayofinvitedmembers, function(invitedmember){
                                     var usersquery = new Parse.Query(Parse.User);
                                     usersquery.equalTo("email", invitedmember);
                                     promises.push(usersquery.first().then(function(popruleruser){
                                        if((typeof popruleruser == "undefined") || (popruleruser == "")) {
                                            invitedUsers.push({"email": invitedmember, "pUserID": null, "fMemberID": null, "name": null});
                                        } else {
                                            invitedUsers.push({"email": invitedmember, "pUserID": popruleruser.id, "fMemberID": popruleruser.get("fUserID"), "name": popruleruser.get("name")});
                                        }
                                     }));
                                 });
                                 return Parse.Promise.when(promises).then(function(){
                                     return invitedUsers;
                                 });
                             }).then(function(allInvitedUsers){
                                 var onlyNonUserNonMembers = new Array();
                                 var promises = new Array();
                                 _.each(allInvitedUsers, function(invitedUser){
                                     var invitedUserEmail = invitedUser["email"] || null;
                                     var invitedUserPUserID = invitedUser["pUserID"] || null;
                                     var invitedUserFMemberID = invitedUser["fMemberID"] || null;
                                     var invitedUserName = invitedUser["name"] || null;
                                     if(invitedUserPUserID == null){
                                         promises.push(onlyNonUserNonMembers.push(invitedUserEmail));
                                     } else {
                                         var SphereMembers = Parse.Object.extend("SphereMembers");
                                         var spheremembersquery = new Parse.Query(SphereMembers);
                                         spheremembersquery.equalTo("sphereObjectID", req.params.id);
                                         spheremembersquery.equalTo("pUserID", invitedUserPUserID);
                                         promises.push(spheremembersquery.first().then(function(spheremember){
                                             if((typeof spheremember == "undefined") || (spheremember == "")) {
                                                 var InvitedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
                                                 var InvitedSphereMember = new InvitedSphereMembers();
                                                 InvitedSphereMember.set("email", invitedUserEmail);
                                                 InvitedSphereMember.set("sphereObjectID", sphereObjectID);
                                                 InvitedSphereMember.save().then(function(){
                                                     var SphereMembers = Parse.Object.extend("SphereMembers");
                                                     var sphereMember = new SphereMembers();
                                                     sphereMember.set("administrator", false);
                                                     sphereMember.set("fMemberID", invitedUserFMemberID);
                                                     sphereMember.set("pUserID", invitedUserPUserID);
                                                     sphereMember.set("name", invitedUserName);
                                                     sphereMember.set("sphereObjectID", sphereObjectID);
                                                     return sphereMember.save();
                                                 });
                                             } else {
                                                 onlyNonUserNonMembers.push(invitedUserEmail);
                                                 return false;
                                             }
                                         }));
                                     }
                                 });
                                 return Parse.Promise.when(promises).then(function(){
                                     return onlyNonUserNonMembers;
                                 });
                             }).then(function(nonUsersNonMembers){
                                var promises = new Array();
                                _.each(nonUsersNonMembers, function(nonUserNonMemberUnTrimmed) {
                                    var nonUserNonMember = nonUserNonMemberUnTrimmed.trim();
                                    var InvitedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
                                    var invitedspheremembersquery = new Parse.Query(InvitedSphereMembers);
                                    invitedspheremembersquery.equalTo("email", nonUserNonMember);
                                    invitedspheremembersquery.equalTo("sphereObjectID", sphereObjectID);
                                    promises.push(invitedspheremembersquery.first().then(function(invitedspheremember){
                                        if(typeof invitedspheremember !== "undefined") {
                                            return true;
                                        } else {
                                            var InvitedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
                                            var InvitedSphereMember = new InvitedSphereMembers();
                                            InvitedSphereMember.set("email", nonUserNonMember);
                                            InvitedSphereMember.set("sphereObjectID", sphereObjectID);
                                            InvitedSphereMember.save();
                                        }
                                    }));
                                });
                                return Parse.Promise.when(promises);
                             }).then(function(){
                                 res.redirect("/sphere/"+sphereObjectID+"?success=addedMembers");
                             });
                        }
                    });
                }
            });
        });
    }
};
exports.deleteinvite = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         var InvitedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
                         var invitedspherememberquery = new Parse.Query(InvitedSphereMembers);
                         invitedspherememberquery.equalTo("objectId", req.body.inviteid);
                         invitedspherememberquery.first().then(function(invitedspheremember){
                            if((invitedspheremember == null) || (typeof invitedspheremember == "undefined") || (invitedspheremember == "")){
                                res.redirect("/sphere/"+req.params.id+"?error=couldnotdeletedoesnotexist");
                            } else {
                                invitedspheremember.destroy();
                                res.redirect("/sphere/"+req.params.id+"?success=invitedeleted");
                            }
                         });
                     }
                 });
             }
          });
      });
    }
};
exports.deleteallinvites = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         var InvitedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
                         var invitedspherememberquery = new Parse.Query(InvitedSphereMembers);
                         invitedspherememberquery.equalTo("sphereObjectID", req.params.id);
                         invitedspherememberquery.find().then(function(invitedspheremembers){
                            _.each(invitedspheremembers, function(invitedspheremember){
                                invitedspheremember.destroy();
                            });
                         }).then(function(){
                            res.redirect("/sphere/"+req.params.id+"?success=invitedeleted");
                         });
                     }
                 });
             }
          });
      });
    }
};
exports.mergerequest = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         if(req.params.id == req.params.mid) {
                           res.redirect("/sphere/"+req.params.id+"?error=selfasparent");
                         } else {
                             var MergeRequests = Parse.Object.extend("MergeRequests");
                             var mergerequests = new Parse.Query(MergeRequests);
                             mergerequests.equalTo("childSphere", req.params.id);
                             mergerequests.equalTo("motherSphere", req.params.mid);
                             mergerequests.first().then(function(mergedspheres){
                                if((typeof mergedspheres == "undefined") || (mergedspheres == "") || (mergedspheres == null)){
                                    var MergeRequests = Parse.Object.extend("MergeRequests");
                                    var MergeRequest = new MergeRequests();
                                    MergeRequest.set("childSphere", req.params.id);
                                    MergeRequest.set("motherSphere", req.params.mid);
                                    MergeRequest.save().then(function(){
                                        res.redirect("/sphere/"+req.params.id+"?success=mergerequested");
                                    });
                                }
                             });
                         }
                     }
                 });
             }
          });
      });
    }
};
exports.removemergerequest = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         if(req.params.id == req.params.mid) {
                           res.redirect("/sphere/"+req.params.id+"?error=selfasparent");
                         } else {
                             var MergeRequests = Parse.Object.extend("MergeRequests");
                             var mergerequests = new Parse.Query(MergeRequests);
                             mergerequests.equalTo("childSphere", req.params.id);
                             mergerequests.equalTo("motherSphere", req.params.mid);
                             mergerequests.first().then(function(mergedspheres){
                                if((typeof mergedspheres == "undefined") || (mergedspheres == "") || (mergedspheres == null)){
                                      res.redirect("/sphere/"+req.params.id+"?error=norequestfound");
                                    return false;
                                } else {
                                    mergedspheres.destroy().then(function(){
                                      res.redirect("/sphere/"+req.params.id+"?success=requestremoved");  
                                    });
                                }
                             });
                         }
                     }
                 });
             }
          });
      });
    }
};
exports.removeparent = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         var MergeSpheres = Parse.Object.extend("MergeSpheres");
                         var mergespheresquery = new Parse.Query(MergeSpheres);
                         mergespheresquery.equalTo("childSphere", req.params.id);
                         mergespheresquery.first().then(function(mergedspheres){
                            if((typeof mergedspheres !== "undefined") && (mergedspheres !== "") && (mergedspheres !== null)){
                                mergedspheres.destroy().then(function(){
                                    res.redirect("/sphere/"+req.params.id+"?success=spheresmerged");
                                });
                            } else {
                                res.redirect("/sphere/"+req.params.id+"?error=noparent");
                            }
                         });
                     }
                 });
             }
          });
      });
    }
};
exports.removechild = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         var MergeSpheres = Parse.Object.extend("MergeSpheres");
                         var mergespheresquery = new Parse.Query(MergeSpheres);
                         mergespheresquery.equalTo("motherSphere", req.params.id);
                         mergespheresquery.equalTo("childSphere", req.params.cid);
                         mergespheresquery.first().then(function(mergedspheres){
                            if((typeof mergedspheres !== "undefined") && (mergedspheres !== "") && (mergedspheres !== null)){
                                mergedspheres.destroy().then(function(){
                                    res.redirect("/sphere/"+req.params.id+"?success=removedchildsphere");
                                });
                            } else {
                                res.redirect("/sphere/"+req.params.id+"?error=nochildofthatid");
                            }
                         });
                     }
                 });
             }
          });
      });
    }
};
exports.search = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        var page_name = req.body.sphere_name;
        Parse.Promise.when([ 
            Parse.Cloud.run("sphereobjects",{"pagename": page_name}) //r2
        ]).then(function(r2){
            var sphereObjects = r2 || [];
            if((typeof sphereObjects !== undefined) && (sphereObjects !== "") && (sphereObjects !== null)) {
              var suggestions = new Array();
              _.each(sphereObjects, function(sphereObject){
                var motherSphereIDsphereID = sphereObject['sphereID'] || "";
                var sphereName = sphereObject['sphereName'] || "";
                var sphereDescription = sphereObject['sphereDescription'] || "";
                suggestions.push("<h4>"+sphereName+"</h4><a class='btn btn-default' data-toggle='collapse' href='#collapseDescription"+motherSphereIDsphereID+"' aria-expanded='false' aria-controls='collapseDescription"+motherSphereIDsphereID+"'>Show Description</a><div class='collapse' id='collapseDescription"+motherSphereIDsphereID+"'><div class='well'>"+sphereDescription+"</div></div><form method='POST' action='/sphere/"+req.params.id+"/mergerequest/"+motherSphereIDsphereID+"' style='display: inline-block;'><input type='submit' class='btn btn-md btn-primary' value='Request Merge' style='display: inline-block;'></form>");
              });
              res.send(suggestions);
            }
        });
    });
};
exports.searchinvitesbyemail = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        Parse.Promise.when([
          Parse.Cloud.run("hello",{}), //r1
          ]).then(function(r1){
            var page_name = req.body.sphere_invite_email;
            var sphereObjectID = req.body.sphere_object_id;
            Parse.Promise.when([ 
                Parse.Cloud.run("invitesearchbyemail",{"pagename": page_name, "sphereObjectID": sphereObjectID}) //r2
            ]).then(function(r2){
                var SphereMembers = r2 || [];
                if((typeof SphereMembers !== undefined) && (SphereMembers !== "") && (SphereMembers !== null)) {
                  var suggestions = new Array();
                  _.each(SphereMembers, function(sphereMember){
                    var email = sphereMember['email'] || "";
                    suggestions.push("<span>"+email+"</span><sup><a href='javascript:void(0);' id='addemailtolistbutton' data-nameofrecipient='' data-emailtoadd='"+email+"'>Add to List</a></sup>");
                  });
                  res.send(suggestions);
                }
            });
        });
    });
};
exports.searchmembersbyemail = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        Parse.Promise.when([
          Parse.Cloud.run("hello",{}), //r1
          ]).then(function(r1){
            var page_name = req.body.sphere_member_email;
            var sphereObjectID = req.body.sphere_object_id;
            Parse.Promise.when([ 
                Parse.Cloud.run("membersearchbyemail",{"pagename": page_name, "sphereObjectID": sphereObjectID}) //r2
            ]).then(function(r2){
                var SphereMembers = r2 || [];
                if((typeof SphereMembers !== undefined) && (SphereMembers !== "") && (SphereMembers !== null)) {
                  var suggestions = new Array();
                  _.each(SphereMembers, function(sphereMember){
                    var email = sphereMember['email'] || "";
                    suggestions.push("<span>"+email+"</span><sup><a href='javascript:void(0);' id='addemailtolistbutton' data-nameofrecipient='' data-emailtoadd='"+email+"'>Add to List</a></sup>");
                  });
                  res.send(suggestions);
                }
            });
        });
    });
};
exports.searchmembersbyname = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        Parse.Promise.when([
          Parse.Cloud.run("hello",{}), //r1
          ]).then(function(r1){
            var page_name = req.body.sphere_member_name;
            var sphereObjectID = req.body.sphere_object_id;
            Parse.Promise.when([ 
                Parse.Cloud.run("spherememberslookup",{"pagename": page_name, "sphereObjectID": sphereObjectID}) //r2
            ]).then(function(r2){
                var SphereMembers = r2 || [];
                if((typeof SphereMembers !== undefined) && (SphereMembers !== "") && (SphereMembers !== null)) {
                  var suggestions = new Array();
                  _.each(SphereMembers, function(sphereMember){
                    var email = sphereMember['email'] || "";
                    var name = sphereMember['name'] || "";
                    var pictureURL = sphereMember['pictureURL'] || "";
                    suggestions.push("<img src='"+pictureURL+"'><span>"+name+"</span><br><span>"+email+"</span><sup><a href='javascript:void(0);' id='addemailtolistbutton' data-nameofrecipient='"+name+"' data-emailtoadd='"+email+"'>Add to List</a></sup>");
                  });
                  res.send(suggestions);
                }
            });
        });
    });
};
exports.sendemailtomembers = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var Mandrill = require('mandrill');
          Mandrill.initialize('1jJldQZE1D1KawEyk9ebrQ');
          Parse.Promise.when([
              Parse.Cloud.run("hello",{}),
          ]).then(function(r1){
              var domain = r1['appURL'];
              var pUserID = user.id;
              var fMemberID = user.get("fUserID");
              var useremail = user.get("email");
              var username = user.get("name");
              var sphereObjectID = req.params.id;
              var emailto = req.body.emailto;
              var emailtocurrentmemberssubject = req.body.emailtocurrentmemberssubject;
              var emailtocurrentmembersmessage = req.body.emailtocurrentmembersmessage;
              var SphereMembers = Parse.Object.extend("SphereMembers");
              var spheremembersquery = new Parse.Query(SphereMembers);
              spheremembersquery.equalTo("pUserID", pUserID);
              spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
              spheremembersquery.first().then(function(spheremember){
                 if((typeof spheremember == "undefined") || (spheremember == "")) {
                     res.redirect("/spheres?error=notamemberofsphere");
                 } else{
                     var spheresObject = Parse.Object.extend('Spheres');
                     var spheresquery = new Parse.Query(spheresObject);
                     spheresquery.equalTo("objectId", sphereObjectID);
                     spheresquery.first().then(function(sphere){
                         var sphereAdmins = sphere.get("sphereAdmins");
                         var spherename = sphere.get("sphereName");
                         var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                         if(isAdminCheck == "undefined") {
                             res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                             return false;
                         } else {
                             return spherename;
                         }
                     }).then(function(spherename){
                         if(spherename !== false){
                             if(emailto == "allcurrentmembers") {
                                 var emailtosend = new Object();
                                 emailtosend.sphereName = spherename;
                                 emailtosend.listType = "allcurrentmembers";
                                 var promises = new Array();
                                 var SphereMembers = Parse.Object.extend("SphereMembers");
                                 var spheremembersquery = new Parse.Query(SphereMembers);
                                 spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
                                 promises.push(spheremembersquery.find().then(function(spheremembers){
                                    var torecipients = new Array();
                                    var promises2 = new Array();
                                    _.each(spheremembers, function(spheremember){
                                       var spherememberid = spheremember.get("pUserID");
                                       var userquery = new Parse.Query(Parse.User);
                                       userquery.equalTo("objectId", spherememberid);
                                       promises2.push(userquery.first().then(function(user){
                                          var toemailaddress = user.get("email");
                                          var toname = user.get("name");
                                          torecipients.push({"name":toname, "email": toemailaddress});
                                       }));
                                    });
                                    return Parse.Promise.when(promises2).then(function(){
                                        emailtosend.toRecipients = torecipients;
                                        return emailtosend;
                                    });
                                 }));
                                 return Parse.Promise.when(promises).then(function(){
                                     return emailtosend;
                                 });
                             } 
                             else if(emailto == "allinvitedmembers"){
                                 var emailtosend = new Object();
                                 emailtosend.sphereName = spherename;
                                 emailtosend.listType = "allinvitedmembers";
                                 var promises = new Array();
                                 var InvitedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
                                 var invitedspheremembersquery = new Parse.Query(InvitedSphereMembers);
                                 invitedspheremembersquery.equalTo("sphereObjectID", sphereObjectID);
                                 promises.push(invitedspheremembersquery.find().then(function(invitedmembers){
                                    var torecipients = new Array();
                                    _.each(invitedmembers, function(invitedmember){
                                        var toemailaddress = invitedmember.get("email");
                                        torecipients.push({"name":"", "email": toemailaddress});
                                    });
                                    return Parse.Promise.when(torecipients).then(function(){
                                        emailtosend.toRecipients = torecipients;
                                        return emailtosend;
                                    });
                                 }));
                                 return Parse.Promise.when(promises).then(function(){
                                     return emailtosend;
                                 });
                             }
                             else if(emailto == "alladmins"){
                                 var emailtosend = new Object();
                                 emailtosend.sphereName = spherename;
                                 emailtosend.listType = "alladmins";
                                 var promises = new Array();
                                 var torecipients = new Array();
                                 var Spheres = Parse.Object.extend("Spheres");
                                 var spheresquery = new Parse.Query(Spheres);
                                 spheresquery.equalTo("objectId", sphereObjectID);
                                 promises.push(spheresquery.first().then(function(sphere){
                                    var sphereadmins = sphere.get("sphereAdmins");
                                    var promises2 = new Array();
                                    _.each(sphereadmins, function(sphereadmin){
                                       var userquery = new Parse.Query(Parse.User);
                                       userquery.equalTo("objectId", sphereadmin);
                                       promises2.push(userquery.first().then(function(user){
                                          var toemailaddress = user.get("email");
                                          var toname = user.get("name");
                                          torecipients.push({"name":toname, "email": toemailaddress});
                                       }));
                                    });
                                    return Parse.Promise.when(promises2).then(function(){
                                        emailtosend.toRecipients = torecipients;
                                        return emailtosend;
                                    });
                                 }));
                                 return Parse.Promise.when(promises).then(function(){
                                     return emailtosend;
                                 });
                             } else if(emailto == "individuals"){
                                 var emailtosend = new Object();
                                 emailtosend.sphereName = spherename;
                                 emailtosend.listType = "individuals";
                                 emailtosend.toRecipients = req.body.individualemails;
                                 return emailtosend;
                             }
                         }
                    }).then(function(emailtosend){
                                 var SphereAdminToMembersEmails = Parse.Object.extend("SphereAdminToMembersEmails");
                                 var SphereAdminToMembersEmail = new SphereAdminToMembersEmails();
                                 SphereAdminToMembersEmail.set("fromName", username);
                                 SphereAdminToMembersEmail.set("frompUserID", pUserID);
                                 SphereAdminToMembersEmail.set("fromfMemberID", fMemberID);
                                 SphereAdminToMembersEmail.set("fromemail", useremail);
                                 SphereAdminToMembersEmail.set("sphereName", emailtosend.sphereName);
                                 SphereAdminToMembersEmail.set("listType", emailtosend.listType);
                                 SphereAdminToMembersEmail.set("sphereObjectID", sphereObjectID);
                                 SphereAdminToMembersEmail.set("subject", emailtocurrentmemberssubject);
                                 SphereAdminToMembersEmail.set("message", emailtocurrentmembersmessage);
                                 SphereAdminToMembersEmail.set("recipients", emailtosend.toRecipients);
                                 SphereAdminToMembersEmail.save(null, {
                                     success: function(savedemailitem){
                                         return savedemailitem;
                                     },
                                     error: function(savedemailitem, error){
                                        res.redirect("/sphere/"+sphereObjectID+"?error=emailnotsent");
                                        return false;
                                     }
                                 }).then(function(savedemailitem){
                                    if(savedemailitem == false){
                                        return false;
                                    } else {
                                          var promises = new Array();
                                          var emailsentid = savedemailitem.id;
                                          var subjectpreview = emailtocurrentmemberssubject.substring(0, 90);
                                          var recipients = savedemailitem.get("recipients");
                                          _.each(recipients, function(recipient){
                                              var toemail = recipient["email"];
                                              var toname = recipient["name"] || "";
                                              promises.push(Mandrill.sendTemplate({
                                              key: "1jJldQZE1D1KawEyk9ebrQ",
                                              template_name: "emailstomembers",
                                              template_content: [
                                                  {
                                                      name: "preheader_content00",
                                                      content: subjectpreview
                                                  },
                                                  {
                                                      name: "header",
                                                      content: emailtosend.sphereName
                                                  },
                                                  {
                                                      name: "body_content",
                                                      content: emailtocurrentmembersmessage
                                                  },
                                                  {
                                                      name: "footer_content01",
                                                      content: "<br><div id='goToSphere'><a href='https://"+domain+"/sphere/"+sphereObjectID+"'>Go to Sphere</a></div>"
                                                  },
                                                  {
                                                      name: "footer_content02",
                                                      content: username+" sent this message from within PopRuler as an administrator of "+emailtosend.sphereName+"."
                                                  }
                                              ],
                                              message: {
                                                subject: emailtocurrentmemberssubject,
                                                from_email: useremail,
                                                from_name: username,
                                                to: [
                                                  {
                                                    email: toemail,
                                                    name: toname
                                                  }
                                                ],
                                              },
                                            },{
                                              success: function(httpResponse) {
                                                return true;
                                              },
                                              error: function(httpResponse) {
                                                return false;
                                              }
                                            }));
                                          });
                                          return Parse.Promise.when(promises).then(function(){
                                             return savedemailitem; 
                                          });
                                    }
                                }).then(function(savedemailitem){
                                    var savedemailitemid = savedemailitem.id;
                                    res.redirect("/sphere/"+sphereObjectID+"?success=emailsent&sentemailid="+savedemailitemid);
                                    return true;
                                });
                             });
                  }
              });
          });
      });
    }
};