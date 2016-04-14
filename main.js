require('cloud/app.js');
var _ = require('underscore');
var moment = require('moment');
var Image = require("parse-image");
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
     
     
    var appURL = 'www.represent.xyz'; var appAT = "Secret"; var appID = '1676660009220458'; //Production
  
    var representxyzapp= {appID: appID, appURL: appURL, appAT: appAT};
     
    response.success(representxyzapp);
});
Parse.Cloud.define("userprofileimageurl", function(request, response) {
 Parse.Cloud.httpRequest({
  url: 'https://graph.facebook.com/me/picture',
  params: {
    redirect : false,
    access_token : request.params.accesstoken,
  },
  success: function(httpResponse) {
    var userprofileimage = httpResponse.data.data.url;
    response.success(userprofileimage);
  },
  error: function(httpResponse) {
    response.success(0);
  }
 });
});
Parse.Cloud.define("spherememberslookup", function(request, response) {
    var pagename = request.params.pagename;
    var SphereMembers = Parse.Object.extend("SphereMembers");
    var spheremembersquery = new Parse.Query(SphereMembers);
    spheremembersquery.startsWith("name", pagename);
    spheremembersquery.equalTo("sphereObjectID", request.params.sphereObjectID);
    spheremembersquery.find().then(function(spheremembers) {
        var SphereMembers = new Array();
        var promises = new Array();
        _.each(spheremembers, function(spheremember){
            var sphereMemberpUserID = spheremember.get("pUserID");
            var userquery = new Parse.Query(Parse.User);
            userquery.equalTo("pUserID", sphereMemberpUserID);
            promises.push(userquery.first().then(function(user){
                var promises2 = new Array();
                var ProfilePictures = Parse.Object.extend("ProfilePictures");
                var profilepicturequery = new Parse.Query(ProfilePictures);
                profilepicturequery.equalTo("pageObjectID", sphereMemberpUserID);
                profilepicturequery.equalTo("pageType", "user");
                promises2.push(profilepicturequery.first().then(function(pictureobject){
                    if((typeof pictureobject !== "undefined") && (pictureobject !== "") && (pictureobject !== null)) {
                        var pictureObjectID = pictureobject.get("pictureObjectID");
                        var promises3 = new Array();
                        var UserPictures = Parse.Object.extend("UserPictures");
                        var userpicturesquery = new Parse.Query(UserPictures);
                        userpicturesquery.equalTo("pageObjectID", pictureObjectID);
                        promises3.push(userpicturesquery.first().then(function(userpicture){
                           var userpicturefile = userpicture.get("picture");
                           var userpictureurl = userpicturefile.url();
                           SphereMembers.push({"pUserID": user.id, "fMemberID": user.get("fUserID"), "email": user.get("email"), "name": user.get("name"), "pictureURL": userpictureurl});
                           return true;
                        }));
                        return Parse.Promise.when(promises3);
                    } else {
                        var userpicture = "";
                        SphereMembers.push({"pUserID": user.id, "fMemberID": user.get("fUserID"), "email": user.get("email"), "name": user.get("name"), "pictureURL": userpicture});
                        return true;
                    }
                }));
                return Parse.Promise.when(promises2).then(function(){
                   return true; 
                });
            }));
        });
        return Parse.Promise.when(promises).then(function(){
            return SphereMembers;
        });
    }).then(function(listofspheremembers){
        response.success(listofspheremembers);
    });
});
Parse.Cloud.define("invitesearchbyemail", function(request, response) {
    var pagename = request.params.pagename;
    var InvitedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
    var invitedspheremembersquery = new Parse.Query(InvitedSphereMembers);
    invitedspheremembersquery.startsWith("email", pagename);
    invitedspheremembersquery.equalTo("sphereObjectID", request.params.sphereObjectID);
    invitedspheremembersquery.find().then(function(invitedspheremembers) {
        var InvitedSphereMembers = new Array();
        var promises = new Array();
        _.each(invitedspheremembers, function(invitedspheremember){
            var email = invitedspheremember.get("email");
            InvitedSphereMembers.push({"email": email});
        });
        return Parse.Promise.when(promises).then(function(){
            return InvitedSphereMembers;
        });
    }).then(function(listofspheremembers){
        response.success(listofspheremembers);
    });
});
Parse.Cloud.define("membersearchbyemail", function(request, response) {
    var promises4 = new Array();
    var pagename = request.params.pagename;
    var userquery = new Parse.Query(Parse.User);
    userquery.startsWith("email", pagename);
    userquery.find().then(function(foundusers){
        if((typeof foundusers !== "undefined") && (foundusers !== "") && (foundusers !== null)){
            var SphereMembersArray = new Array();
            _.each(foundusers, function(founduser){
                var membername = founduser.get("name");
                var SphereMembers = Parse.Object.extend("SphereMembers");
                var spheremembersquery = new Parse.Query(SphereMembers);
                spheremembersquery.equalTo("name", membername);
                spheremembersquery.equalTo("sphereObjectID", request.params.sphereObjectID);
                promises4.push(spheremembersquery.find().then(function(spheremembers) {
                    var promises = new Array();
                    _.each(spheremembers, function(spheremember){
                        var sphereMemberpUserID = spheremember.get("pUserID");
                        var userquery = new Parse.Query(Parse.User);
                        userquery.equalTo("pUserID", sphereMemberpUserID);
                        promises.push(userquery.first().then(function(user){
                            var promises2 = new Array();
                            var ProfilePictures = Parse.Object.extend("ProfilePictures");
                            var profilepicturequery = new Parse.Query(ProfilePictures);
                            profilepicturequery.equalTo("pageObjectID", sphereMemberpUserID);
                            profilepicturequery.equalTo("pageType", "user");
                            promises2.push(profilepicturequery.first().then(function(pictureobject){
                                if((typeof pictureobject !== "undefined") && (pictureobject !== "") && (pictureobject !== null)) {
                                    var pictureObjectID = pictureobject.get("pictureObjectID");
                                    var promises3 = new Array();
                                    var UserPictures = Parse.Object.extend("UserPictures");
                                    var userpicturesquery = new Parse.Query(UserPictures);
                                    userpicturesquery.equalTo("pageObjectID", pictureObjectID);
                                    promises3.push(userpicturesquery.first().then(function(userpicture){
                                       var userpicturefile = userpicture.get("picture");
                                       var userpictureurl = userpicturefile.url();
                                       SphereMembersArray.push({"pUserID": user.id, "fMemberID": user.get("fUserID"), "email": user.get("email"), "name": user.get("name"), "pictureURL": userpictureurl});
                                       return true;
                                    }));
                                    return Parse.Promise.when(promises3);
                                } else {
                                    var userpicture = "";
                                    SphereMembersArray.push({"pUserID": user.id, "fMemberID": user.get("fUserID"), "email": user.get("email"), "name": user.get("name"), "pictureURL": userpicture});
                                    return true;
                                }
                            }));
                            return Parse.Promise.when(promises2).then(function(){
                               return true; 
                            });
                        }));
                    });
                    return Parse.Promise.when(promises).then(function(){
                        return true;
                    });
                }));
            });
            return Parse.Promise.when(promises4).then(function(){
                return SphereMembersArray;
            });
        }
    }).then(function(listofspheremembers){
        response.success(listofspheremembers);
    });
});
Parse.Cloud.define("numberofuserspheres", function(request, response) {
    var SphereMembersObject = Parse.Object.extend('SphereMembers');
    var membersquery = new Parse.Query(SphereMembersObject);
    membersquery.equalTo("fMemberID", request.params.fUserID);
    membersquery.count({
        success: function(count) {
            var numberofspheres = count;
            response.success(numberofspheres);
        },
        error: function(error) {
        }
    });
});
Parse.Cloud.define("userprofileinfo", function(request, response) {
    var Profiles = Parse.Object.extend('Profiles');
    var profilesquery = new Parse.Query(Profiles);
    profilesquery.equalTo("pUserID", request.params.pUserID);
    profilesquery.first().then(function(profile){
        if((typeof profile == "undefined") || (profile == "") || (profile == null)){
            response.success(0);
        } else {
            response.success(profile);
        }
    });
});
Parse.Cloud.define("somerandomspheres", function(request, response) {
    var spheres = Parse.Object.extend('Spheres');
    var spheresquery = new Parse.Query(spheres);
    spheresquery.limit(7);
    spheresquery.find().then(function(spheres){
        var arrayofspheres = new Array();
        _.each(spheres, function(sphere){
            arrayofspheres.push({
                "sphereObjectID": sphere.id,
                "sphereName": sphere.get("sphereName"),
                "sphereDescription": sphere.get("sphereDescription")
            });
        });
        response.success(arrayofspheres);
    });
});
Parse.Cloud.define("memberbelongstospheres", function(request, response) {
   var SphereMembers = Parse.Object.extend("SphereMembers");
   var spheremembersquery = new Parse.Query(SphereMembers);
   spheremembersquery.equalTo("pUserID", request.params.pUserID);
   spheremembersquery.find().then(function(spheremembers){
       var sphereidsthatmemberbelongsto = new Array();
      _.each(spheremembers, function(sphere) {
        var sphereObjectID = sphere.get("sphereObjectID");
        sphereidsthatmemberbelongsto.push(sphereObjectID);
      });
      return Parse.Promise.when(sphereidsthatmemberbelongsto).then(function(){
        return sphereidsthatmemberbelongsto;
      });
   }).then(function(sphereidsthatmemberbelongsto){
       var allparentspheres = new Array();
       var promises = new Array();
       function buildParentSpheresArray(parentsphereid){
          var promises2 = new Array();
          var MergeSpheres = Parse.Object.extend("MergeSpheres");
          var mergespherequery = new Parse.Query(MergeSpheres);
          mergespherequery.equalTo("childSphere", parentsphereid);
          promises2.push(mergespherequery.first().then(function(parentsphere){
              var promises3 = new Array();
              if((typeof parentsphere == "undefined") || (parentsphere == "") || (parentsphere == null)){
                  return false;
              } else {
                  var parentsphereid = parentsphere.get("motherSphere");
                  var OptOutOfSphereParent = Parse.Object.extend("OptOutOfSphereParent");
                  var optoutofsphereparentquery = new Parse.Query(OptOutOfSphereParent);
                  optoutofsphereparentquery.equalTo("sphereObjectID", parentsphereid);
                  optoutofsphereparentquery.equalTo("pUserID", request.params.pUserID);
                  promises3.push(optoutofsphereparentquery.first().then(function(optout){
                     if((typeof optout == "undefined") || (optout == "") || (optout == null)){
                          allparentspheres.push(parentsphereid);
                          return buildParentSpheresArray(parentsphereid);
                     } else {
                         return false;
                     }
                  }));
                  return Parse.Promise.when(promises3);
              }
          }));
          return Parse.Promise.when(promises2);
       }
      _.each(sphereidsthatmemberbelongsto, function(sphereid){
         var promises3 = new Array();
         var OptOutOfSphereParent = Parse.Object.extend("OptOutOfSphereParent");
         var optoutofsphereparentquery = new Parse.Query(OptOutOfSphereParent);
         optoutofsphereparentquery.equalTo("sphereObjectID", sphereid);
         optoutofsphereparentquery.equalTo("pUserID", request.params.pUserID);
         promises.push(optoutofsphereparentquery.first().then(function(optout){
             if((typeof optout == "undefined") || (optout == "") || (optout == null)){
                  var MergeSpheres = Parse.Object.extend("MergeSpheres");
                  var mergespherequery = new Parse.Query(MergeSpheres);
                  mergespherequery.equalTo("childSphere", sphereid);
                  promises3.push(mergespherequery.first().then(function(parentsphere){
                     if((typeof parentsphere == "undefined") || (parentsphere == "") || (parentsphere == null)){
                         return false;
                     } else {
                         var parentsphereid = parentsphere.get("motherSphere");
                         var isAlreadyMember = _.find(sphereidsthatmemberbelongsto, function(num){ return num == parentsphereid; });
                         if(isAlreadyMember){
                             return false;
                         } else {
                             if((typeof optout == "undefined") || (optout == "") || (optout == null)){
                                 allparentspheres.push(parentsphereid);
                                 return buildParentSpheresArray(parentsphereid);
                             } else {
                                 return false;
                             }
                         }
                     }
                  }));
                  return Parse.Promise.when(promises3);
             } else {
                 return false;
             }
         }));
      });
      return Parse.Promise.when(promises).then(function(){
         var allmemberspheres = sphereidsthatmemberbelongsto.concat(allparentspheres);
         return allmemberspheres;
      });
   }).then(function(allmemberspheres){
       response.success(allmemberspheres);
   });
});
Parse.Cloud.define("memberisadminofspheres", function(request, response) {
   var SphereMembers = Parse.Object.extend("SphereMembers");
   var spheremembersquery = new Parse.Query(SphereMembers);
   spheremembersquery.equalTo("pUserID", request.params.pUserID);
   spheremembersquery.equalTo("administrator", true);
   spheremembersquery.find().then(function(spheremembers){
       var sphereidsthatmemberbelongsto = new Array();
      _.each(spheremembers, function(sphere) {
        sphereidsthatmemberbelongsto.push(sphere.get("sphereObjectID"));
      });
      response.success(sphereidsthatmemberbelongsto); 
   });
});
Parse.Cloud.define("hasmemberpaidyearlysubscription", function(request, response) {
   var subscriptionDetails = Parse.Object.extend("SphereSubscriptions");
   var d = new Date(1448460159000);
   var sphereSubscriptionsQuery = new Parse.Query(subscriptionDetails);
   sphereSubscriptionsQuery.equalTo("sphereObjectID", request.params.sphereObjectID);
   sphereSubscriptionsQuery.exists("mostRecentPayment");
   sphereSubscriptionsQuery.descending("mostRecentPayment");
   sphereSubscriptionsQuery.greaterThan("mostRecentPayment", d);
   sphereSubscriptionsQuery.first().then(function(spheremembersubscription){
      if((spheremembersubscription !== "") && (spheremembersubscription !== null) && (typeof spheremembersubscription !== "undefined")){
        response.success(spheremembersubscription);
      } else {
        response.success(false);
      } 
   });
});
Parse.Cloud.define("ismembercurrentwithsubscription", function(request, response) {
   var subscriptionDetails = Parse.Object.extend("SphereSubscriptions");
   var d = new Date(1448460159000);
   var sphereSubscriptionsQuery = new Parse.Query(subscriptionDetails);
   sphereSubscriptionsQuery.equalTo("sphereObjectID", request.params.sphereObjectID);
   sphereSubscriptionsQuery.exists("mostRecentPayment");
   sphereSubscriptionsQuery.descending("mostRecentPayment");
   sphereSubscriptionsQuery.greaterThan("mostRecentPayment", d);
   sphereSubscriptionsQuery.first().then(function(spheremembersubscription){
      if((spheremembersubscription !== "") && (spheremembersubscription !== null) && (typeof spheremembersubscription !== "undefined")){
        var mostRecentPayment = spheremembersubscription.get("mostRecentPayment") || false;
        var mostRecentPaymentUnixMil = moment(mostRecentPayment).unix() * 1000;
        var dateJoined = spheremembersubscription.createdAt;
        var dateJoinedUnixMil = moment(dateJoined).unix() * 1000;
        var nowdatetimeunixmil = new Date().getTime();
        if((mostRecentPayment === false) || (typeof mostRecentPayment == "undefined") || (mostRecentPayment == null)){
          if((nowdatetimeunixmil - dateJoinedUnixMil) < (30 * 24 * 60 * 60 * 1000)){
            response.success(true);
          } else {
            response.success(false);
          }
        } else {
          if((nowdatetimeunixmil - mostRecentPaymentUnixMil) < (365 * 24 * 60 * 60 * 1000)){
            response.success(true);
          } else {
            response.success(false);
          }
        }
      } else {
        response.success(false);
      } 
   });
});
Parse.Cloud.define("membersubscriptions", function(request, response) {
  var subscriptionDetails = Parse.Object.extend("SphereSubscriptions");
  var sphereSubscriptionsQuery = new Parse.Query(subscriptionDetails);
  sphereSubscriptionsQuery.equalTo("pUserID", request.params.pUserID);
  sphereSubscriptionsQuery.find().then(function(spheremembersubscriptions){
    if((spheremembersubscriptions !== "") && (spheremembersubscriptions !== null) && (typeof spheremembersubscriptions !== "undefined")){
      var subscriptions = new Array();
      var promises = new Array();
      _.each(spheremembersubscriptions, function(membersubscription){
        var sphereObjectID = membersubscription.get("sphereObjectID");
        var sphereObjects = Parse.Object.extend("Spheres");
        var spheresquery = new Parse.Query(sphereObjects);
        spheresquery.equalTo("objectId", sphereObjectID);
        promises.push(spheresquery.first().then(function(sphere){
          if((typeof sphere !== "undefined") && (sphere !== "") && (sphere !== null)){
            var joinedSphereDate = membersubscription.get("joinedSphere");
            var mostRecentPayment = membersubscription.get("mostRecentPayment");
            var sphereName = sphere.get("sphereName");
            var sphereID = sphere.id;
            var subscriptionObject = {"sphereName": sphereName, "joinedSphereDate": joinedSphereDate, "mostRecentPayment": mostRecentPayment, "sphereObjectID": sphereID};
            subscriptions.push(subscriptionObject);
          }
        }));
      });
      return Parse.Promise.when(promises).then(function(){
        return subscriptions;
      });
    } else {
      return false;
    }
  }).then(function(subscriptions){
    response.success(subscriptions);
  });
});
Parse.Cloud.define("sphereisonlyaparent", function(request, response) {
   var sphereObjectID = request.params.sphereObjectID;
   var memberbelongsToSpheres = request.params.sphereObjectIDs;
   var sphereisaparent = _.find(memberbelongsToSpheres, function(num){ return num == sphereObjectID; });
   if(sphereisaparent){
       var SphereMembers = Parse.Object.extend("SphereMembers");
       var spheremembersquery = new Parse.Query(SphereMembers);
       spheremembersquery.equalTo("pUserID", request.params.pUserID);
       spheremembersquery.equalTo("sphereObjectID", request.params.sphereObjectID);
       spheremembersquery.first().then(function(spheremember){
        if((typeof spheremember == "undefined") || (spheremember == "") || (spheremember == null)){
            response.success(true);  
        } else {
            response.success(false);
        }
       });
   } else {
       response.success(false);
   }
});
Parse.Cloud.define("didmemberoptout", function(request, response) {
     var sphereObjectID = request.params.sphereObjectID;
     var OptOutOfSphereParent = Parse.Object.extend("OptOutOfSphereParent");
     var optoutofsphereparentquery = new Parse.Query(OptOutOfSphereParent);
     optoutofsphereparentquery.equalTo("sphereObjectID", sphereObjectID);
     optoutofsphereparentquery.first().then(function(optout){
         if((typeof optout == "undefined") || (optout == "") || (optout == null)){
             response.success(false);
         } else {
             response.success(true);
         }
     });
});
Parse.Cloud.define("userspheresinfo", function(request, response) {
   var promise = Parse.Promise.as();
   promise = promise.then(function(){
           var spherelist = new Array();
           var promises = new Array();
        _.each(request.params.spheresofmember, function(sphereObjectID) {
           var spheres = Parse.Object.extend("Spheres");
           var spheresquery = new Parse.Query(spheres);
           spheresquery.equalTo("objectId", sphereObjectID);
           promises.push(spheresquery.first().then(function(sphere){
                var sphereAdmins = sphere.get("sphereAdmins");
                var spheredescription = sphere.get("sphereDescription");
                var sphereteaser = spheredescription.slice(0, 150);
                var isAdminCheck = _.find(sphereAdmins, function(num){ return num == request.params.pUserID; });
                if((isAdminCheck == "undefined") || (isAdminCheck == "") || (isAdminCheck == null)) {
                    var isAdmin = false;
                } else {
                    var isAdmin = true;
                }
                var promise2 = Parse.Promise.as();
                return promise2.then(function(){
                    var promises2 = new Array();
                    var adminsOfsphere = new Array();
                    _.each(sphereAdmins, function(sphereAdminID){
                        var usersquery = new Parse.Query(Parse.User);
                        usersquery.equalTo("pUserID", sphereAdminID);
                        promises2.push(usersquery.first().then(function(user){
                          if((typeof user !== "undefined") && (user !== "") && (user !== null)){
                           adminsOfsphere.push({"admin": {
                              "adminpUserID": user.id,
                              "adminName": user.get("name"),
                              "adminfMemberID": user.get("fUserID")
                           }});
                          } 
                        }));
                    });
                    return Parse.Promise.when(promises2).then(function(){
                        return adminsOfsphere;
                    }); 
                }).then(function(sphereadmins){
                    var promises3 = new Array();
                    var ProfilePictures = Parse.Object.extend("ProfilePictures");
                    var profilepicturesquery = new Parse.Query(ProfilePictures);
                    profilepicturesquery.equalTo("pageType", "sphere");
                    profilepicturesquery.equalTo("pageObjectID", sphereObjectID);
                    promises3.push(profilepicturesquery.first().then(function(sphereprofilepicture){
                        if((typeof sphereprofilepicture == "undefined") || (sphereprofilepicture == "") || (sphereprofilepicture == null)){
                            return false;
                        } else {
                            var spherepicturethumbnail = new Object();
                            var promises5 = new Array();
                            var profilepicture = sphereprofilepicture.get("pictureObjectID");
                            var SpherePictures = Parse.Object.extend("SpherePictures");
                            var spherepicturesquery = new Parse.Query(SpherePictures);
                            spherepicturesquery.equalTo("objectId", profilepicture);
                            spherepicturesquery.equalTo("pageObjectID", sphereObjectID);
                            promises5.push(spherepicturesquery.first().then(function(spherepicture){
                               if((typeof spherepicture == "undefined") || (spherepicture == "") || (spherepicture == null)){
                                   return false;
                               } else {
                                   var spherepic = spherepicture.get("thumbnail");
                                   spherepicturethumbnail.thumbnail = spherepic.url();
                               }
                            }));
                            return Parse.Promise.when(promises5).then(function(){
                                return spherepicturethumbnail;
                            });
                        }
                    }).then(function(profilepicture){
                        var nowdatetime = new Date();
                        var promises4 = new Array();
                        var Elections = Parse.Object.extend("Elections");
                        var electionsquery = new Parse.Query(Elections);
                        electionsquery.equalTo("sphereObjectID", sphereObjectID);
                        electionsquery.descending("endDate");
                        electionsquery.limit(4);
                        promises4.push(electionsquery.find().then(function(electionsinsphere){
                            if((typeof electionsinsphere == "undefined") || (electionsinsphere == "") || (electionsinsphere == null)){
                                return false;
                            } else {
                                var elections = new Array();
                                _.each(electionsinsphere, function(election){
                                   var electionName = election.get("electionName");
                                   var electionObjectID = election.id;
                                   var electionEndDateUnformatted = election.get("endDate");
                                   var electionEndDateUnix = moment(electionEndDateUnformatted).unix();
                                   elections.push({"electionName": electionName, "electionObjectID": electionObjectID, "endDateUnix": electionEndDateUnix});
                                });
                                return Parse.Promise.when(elections).then(function(){
                                   return elections; 
                                });
                            }
                        }).then(function(elections){
                            spherelist.push({
                            "isAdmin": isAdmin,
                            "profilePicture": profilepicture,
                            "elections": elections,
                            "sphereAdmins": sphereadmins,
                            "sphereObjectID": sphere.id,
                            "sphereName": sphere.get("sphereName"),
                            "sphereDescription": sphereteaser,
                            "sphereElectionCreation": sphere.get("sphereElectionCreation"),
                            "spherePrivacy": sphere.get("spherePrivacy")
                            });
                        }));
                        return Parse.Promise.when(promises4);
                    }));
                    return Parse.Promise.when(promises3);
                });
            }));
        });
        return Parse.Promise.when(promises).then(function(){
            return spherelist;
        });
    }).then(function(spherelist){
      response.success(spherelist);
    });
});
Parse.Cloud.define("spheremembersinvitedtosphere", function(request, response) {
   var InvtedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
   var invitedspheremembersquery = new Parse.Query(InvtedSphereMembers);
   invitedspheremembersquery.equalTo("sphereObjectID", request.params.sphereObjectID);
   invitedspheremembersquery.find().then(function(invitedspheremembers){
       var memberemailssthathavebeenaddedtosphere = new Array();
       var promises = new Array();
      _.each(invitedspheremembers, function(invitedspheremember) {
        var sphereObjectID = invitedspheremember.get("sphereObjectID");
        var email = invitedspheremember.get("email");
        var inviteid = invitedspheremember.id;
        var userquery = new Parse.Query(Parse.User);
        userquery.equalTo("email", email);
        promises.push(userquery.first().then(function(user){
            if((typeof user == "undefined") || (user == "") || (user == null)){
                memberemailssthathavebeenaddedtosphere.push({"id": inviteid, "email": email, "sphereObjectID": sphereObjectID, "joined": false});
                return false;
            } else {
                var promises2 = new Array();
                var SphereMembers = Parse.Object.extend("SphereMembers");
                var spheremembersquery = new Parse.Query(SphereMembers);
                spheremembersquery.equalTo("pUserID", user.id);
                spheremembersquery.equalTo("sphereObjectID", request.params.sphereObjectID);
                promises2.push(spheremembersquery.first().then(function(spheremember){
                    if((typeof spheremember == "undefined") || (spheremember == "") || (spheremember == null)){
                        memberemailssthathavebeenaddedtosphere.push({"id": inviteid, "email": email, "sphereObjectID": sphereObjectID, "joined": false});
                        return false;
                    } else {
                        memberemailssthathavebeenaddedtosphere.push({"id": inviteid, "email": email, "sphereObjectID": sphereObjectID, "joined": true});
                        return true;
                    }
                }));
                return Parse.Promise.when(promises2);
            }
        }));
        return Parse.Promise.when(promises);
      });
      return Parse.Promise.when(promises).then(function(){
          return memberemailssthathavebeenaddedtosphere;  
      });
   }).then(function(memberemailssthathavebeenaddedtosphere){
       response.success(memberemailssthathavebeenaddedtosphere);
   });
});
Parse.Cloud.define("ismemberinvitedtosphere", function(request, response) {
   var InvtedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
   var invitedspheremembersquery = new Parse.Query(InvtedSphereMembers);
   invitedspheremembersquery.equalTo("sphereObjectID", request.params.sphereObjectID);
   invitedspheremembersquery.equalTo("email", request.params.email);
   invitedspheremembersquery.first().then(function(invitedspheremember){
      if((typeof invitedspheremember == "undefined") || (invitedspheremember == "") || (invitedspheremember == null)){
        response.success(false); 
      } else {
        response.success(true); 
      }
   });
});
Parse.Cloud.define("usernominations", function(request, response) {
   var electionID = request.params.electionObjectID;
   var pUserID = request.params.pUserID;
   var Nominations = Parse.Object.extend('Nominations');
   var nominationsquery = new Parse.Query(Nominations);
   nominationsquery.equalTo("electionID", electionID);
   nominationsquery.equalTo("pUserID", pUserID);
   nominationsquery.find().then(function(usercastnomination){
        if((typeof usercastnomination == "undefined") || (usercastnomination == "") || (usercastnomination === null)) {
            return false;
        } else {
            var nominationsofuser = new Array();
            _.each(usercastnomination, function(nomination){
               var nominationid = nomination.id;
               var nominationName = nomination.get("nominationName");
               nominationsofuser.push({"id": nominationid, "name": nominationName});
            });
            return Parse.Promise.when(nominationsofuser).then(function(){
                return nominationsofuser;
            });
        }
   }).then(function(nominationsofuser){
       response.success(nominationsofuser);
   });
});
Parse.Cloud.define("numberofnominationsallowedperuserinelection", function(request, response) {
   var electionID = request.params.electionObjectID;
   var Elections = Parse.Object.extend('Elections');
   var electionsquery = new Parse.Query(Elections);
   electionsquery.equalTo("objectId", electionID);
   electionsquery.first().then(function(election){
        if((typeof election == "undefined") || (election == "") || (election === null)) {
            response.success(0);
            return false;
        } else {
            var nominationsallowed = election.get("nominationsAllowed") || 0;
            response.success(nominationsallowed);
            return true;
        }
   });
});
Parse.Cloud.define("numberofuservotescast", function(request, response) {
      var pUserID = request.params.pUserID;
      var spheres = request.params.sphereObjectIDs;
      Parse.Promise.as().then(function(){
          var nowdatetime = new Date();
          var activevotesinelection = new Array();
          var electionObjects = new Array();
          for(var i=0; i < spheres.length; i++) {
              var sphere = spheres[i];
              var Elections = Parse.Object.extend("Elections");
              var electionsquery = new Parse.Query(Elections);
              electionsquery.equalTo("sphereObjectID", sphere);
              electionsquery.greaterThan("endDate", nowdatetime);
              electionObjects.push(electionsquery.find().then(function(results){
                 var promises = new Array();
                 _.each(results, function(election) {
                        var electionID = election.id;
                        var Votes = Parse.Object.extend("Votes");
                        var votesquery = new Parse.Query(Votes);
                        votesquery.equalTo("electionObjectID", electionID);
                        votesquery.equalTo("pUserID", pUserID);
                        promises.push(votesquery.find().then(function(votes){
                            var numberofvotesinelection = votes.length || 0;
                            activevotesinelection.push(numberofvotesinelection);
                        }));
                    });
                  return Parse.Promise.when(promises);
              }));
          }
          return Parse.Promise.when(electionObjects).then(function(){
              return activevotesinelection;
          });
      }).then(function(activevotesinelection){
          var votes = _.reduce(activevotesinelection, function(memo, num){ return memo + num; }, 0);
          response.success(votes);
      }, function(error){
          response.error("Adding elections to notifications failed. ");
      });
});
Parse.Cloud.define("numberoftotaluservotestodecision", function(request, response) {
    var nowdatetime = new Date();
    var Votes = Parse.Object.extend("Votes");
    var votesquery = new Parse.Query(Votes);
    votesquery.equalTo("pUserID", request.params.pUserID);
    votesquery.equalTo("voteOrEval", "vote");
    votesquery.greaterThan("electionEndDate", nowdatetime);
    votesquery.find().then(function(votes){
       if((typeof votes == "undefined") || (votes == "") || (votes == null)){
           return [0];
       } else {
           var numvotes = new Array();
           _.each(votes, function(vote){
               var votecast = vote.get("votes");
               numvotes.push(votecast);
           });
           return Parse.Promise.when(numvotes).then(function(){
               return numvotes;
           });
       }
    }).then(function(numvotesarray){
        if(numvotesarray.length > 0){
        var votes = _.reduce(numvotesarray, function(memo, num){ return memo + num; }, 0);
            response.success(votes);
        } else {
            response.success(0);
        }
    });
});
Parse.Cloud.define("totaluservotestodecision", function(request, response) {
    var nowdatetime = new Date();
    var Votes = Parse.Object.extend("Votes");
    var votesquery = new Parse.Query(Votes);
    votesquery.equalTo("pUserID", request.params.pUserID);
    votesquery.equalTo("voteOrEval", "vote");
    votesquery.greaterThan("electionEndDate", nowdatetime);
    votesquery.find().then(function(votes){
       if((typeof votes == "undefined") || (votes == "") || (votes == null)){
           return [0];
       } else {
           var numvotes = new Array();
           _.each(votes, function(vote){
               var votecast = vote.get("votes");
               numvotes.push(votecast);
           });
           return Parse.Promise.when(numvotes).then(function(){
               return numvotes;
           });
       }
    }).then(function(numvotesarray){
        if(numvotesarray.length > 0){
        var votes = _.reduce(numvotesarray, function(memo, num){ return memo + num; }, 0);
            response.success(votes);
        } else {
            response.success(0);
        }
    });
});
Parse.Cloud.define("numberofadminactionitemsforspherejoiners", function(request, response) {
   var adminactionitems = new Array();
   var SphereMembers = Parse.Object.extend("SphereMembers");
   var spheremembersquery = new Parse.Query(SphereMembers);
   spheremembersquery.equalTo("pUserID", request.params.pUserID);
   spheremembersquery.find().then(function(spheremembers){
       Parse.Promise.as().then(function(){
          _.each(spheremembers, function(sphere) {
            var sphereID = sphere.get("sphereObjectID");
            var SphereJoiners = Parse.Object.extend("SphereJoiners");
            var spherejoinersquery = new Parse.Query(SphereJoiners);
            spherejoinersquery.equalTo("sphereObjectID", sphereID);
            spherejoinersquery.equalTo("actiontaken", false);
            spherejoinersquery.find().then(function(spherejoiners){
                _.each(spherejoiners, function(spherejoiner){
                    adminactionitems.push(1);
                });
            });
          });
          return 1;
      }).then(function(){
          var SphereJoiners = Parse.Object.extend("SphereJoiners");
          var spherejoinersquery = new Parse.Query(SphereJoiners);
          spherejoinersquery.equalTo("requesterpUserID", request.params.pUserID);
          spherejoinersquery.equalTo("actiontaken", false);
          spherejoinersquery.find().then(function(spherejoiners){
          _.each(spherejoiners, function(spherejoiner){
                adminactionitems.push(1);
            });
          return 1;
        }).then(function(){
            var numactionitems = adminactionitems.length;
            response.success(numactionitems);
        }); 
      });
   });
});
Parse.Cloud.define("adminactionitemsforspherejoiners", function(request, response) {
   var adminactionitems = new Array();
   var SphereMembers = Parse.Object.extend("SphereMembers");
   var spheremembersquery = new Parse.Query(SphereMembers);
   spheremembersquery.equalTo("pUserID", request.params.pUserID);
   spheremembersquery.find().then(function(spheremembers){
       Parse.Promise.as().then(function(){
          _.each(spheremembers, function(sphere) {
            var sphereID = sphere.get("sphereObjectID");
            var SphereJoiners = Parse.Object.extend("SphereJoiners");
            var spherejoinersquery = new Parse.Query(SphereJoiners);
            spherejoinersquery.equalTo("sphereObjectID", sphereID);
            spherejoinersquery.equalTo("actiontaken", false);
            spherejoinersquery.find().then(function(spherejoiners){
                _.each(spherejoiners, function(spherejoiner){
                    var createdAt = moment(spherejoiner.createdAt).unix();
                    var itemcontent = {
                        "createdAt": createdAt,
                        "requesterpUserID": spherejoiner.get("requesterpUserID"),
                        "requesterfMemberID": spherejoiner.get("requesterfMemberID"),
                        "sphereObjectID": spherejoiner.get("sphereObjectID"),
                        "sphereName": spherejoiner.get("sphereName"),
                        "requesterName": spherejoiner.get("requesterName")
                    };
                    adminactionitems.push({"itemtype": "approverequest", "itemcontent": itemcontent});
                });
            });
          });
          return 1;
      }).then(function(){
          var SphereJoiners = Parse.Object.extend("SphereJoiners");
          var spherejoinersquery = new Parse.Query(SphereJoiners);
          spherejoinersquery.equalTo("requesterpUserID", request.params.pUserID);
          spherejoinersquery.equalTo("actiontaken", false);
          spherejoinersquery.find().then(function(spherejoiners){
          _.each(spherejoiners, function(spherejoiner){
                var createdAt = moment(spherejoiner.createdAt).unix();
                var itemcontent = {
                    "createdAt": createdAt,
                    "requesterpUserID": spherejoiner.get("requesterpUserID"),
                    "requesterfMemberID": spherejoiner.get("requesterfMemberID"),
                    "sphereObjectID": spherejoiner.get("sphereObjectID"),
                    "sphereName": spherejoiner.get("sphereName"),
                    "requesterName": spherejoiner.get("requesterName")
                };
                adminactionitems.push({"itemtype": "sentrequest", "itemcontent": itemcontent});
            });
          return 1;
        }).then(function(){
            response.success(adminactionitems);
        }); 
      });
   });
});
Parse.Cloud.define("numberofadminactionitemsforspheremergers", function(request, response) {
   var sphereObjectIDs = request.params.sphereObjectIDs;
   var promise = Parse.Promise.as();
   promise.then(function(){
       var promises = new Array();
       var adminactionitemsofspheres = new Array();
       _.each(sphereObjectIDs, function(sphereObjectID){
           var MergeRequests = Parse.Object.extend("MergeRequests");
           var mergerequestsquery = new Parse.Query(MergeRequests);
           mergerequestsquery.equalTo("motherSphere", sphereObjectID);
           promises.push(mergerequestsquery.find().then(function(spheres){
             if((typeof spheres == "undefined") || (spheres == "")) {
                return false;
            } else {
                  var promises2 = new Array();
              _.each(spheres, function(sphere) {
                  var childsphereid = sphere.get("childSphere");
                  var mothersphereid = sphere.get("motherSphere");
                  var promises3 = new Array();
                  var MergeSpheres = Parse.Object.extend("MergeSpheres");
                  var mergespheresquery = new Parse.Query(MergeSpheres);
                  mergespheresquery.equalTo("motherSphere", mothersphereid);
                  mergespheresquery.equalTo("childSphere", childsphereid);
                  promises2.push(mergespheresquery.first().then(function(motherspherealreadymerged){
                    if((typeof motherspherealreadymerged == "undefined") || (motherspherealreadymerged == "") || (motherspherealreadymerged == null)) {
                        promises3.push(adminactionitemsofspheres.push(1));
                    } else {
                        return false;
                    }
                  }));
                });
                return Parse.Promise.when(promises2);
            }
           }));
       });
       return Parse.Promise.when(promises).then(function(){
          return adminactionitemsofspheres; 
       });
   }).then(function(adminactionitems){
       var promises = new Array();
       var adminactionitemsofspheres = new Array();
       _.each(sphereObjectIDs, function(sphereObjectID){
          var MergeRequests = Parse.Object.extend("MergeRequests");
          var mergerequestsquery = new Parse.Query(MergeRequests);
          mergerequestsquery.equalTo("childSphere", sphereObjectID);
          promises.push(mergerequestsquery.first().then(function(spheremergerequests){
              if((typeof spheremergerequests == "undefined") || (spheremergerequests == "")) {
                  return false;
              } else {
                  var promises3 = new Array();
                  var MergeSpheres = Parse.Object.extend("MergeSpheres");
                  var mergespheresquery = new Parse.Query(MergeSpheres);
                  mergespheresquery.equalTo("childSphere", sphereObjectID);
                  promises3.push(mergespheresquery.first().then(function(childspherealreadymerged){
                      if((typeof childspherealreadymerged == "undefined") || (childspherealreadymerged == "") || (childspherealreadymerged == null)) {
                            return adminactionitemsofspheres.push(1);
                      } else {
                          return false;
                      }
                  }));
                return Parse.Promise.when(promises3);  
              }
          }));
      });
      return Parse.Promise.when(promises).then(function(){
          return adminactionitemsofspheres.concat(adminactionitems);
      });
   }).then(function(adminactionitems){
       var numadminactionitems = adminactionitems.length;
       response.success(numadminactionitems);
   });
});
Parse.Cloud.define("adminactionitemsforspheremergerstoparent", function(request, response) {
   var sphereObjectIDs = request.params.sphereObjectIDs;
   var promise = Parse.Promise.as();
   promise.then(function(){
       var promises = new Array();
       var adminactionitemsforparentaction = new Array();
       _.each(sphereObjectIDs, function(sphereObjectID){
           var MergeRequests = Parse.Object.extend("MergeRequests");
           var mergerequestsquery = new Parse.Query(MergeRequests);
           mergerequestsquery.equalTo("motherSphere", sphereObjectID);
           promises.push(mergerequestsquery.find().then(function(spheres){
            if((typeof spheres == "undefined") || (spheres == "")) {
                return false;
            } else {
              var promises2 = new Array();
              _.each(spheres, function(spheremergerequest) {
                    var sphere1 = spheremergerequest.get("motherSphere");
                    var sphere2 = spheremergerequest.get("childSphere");
                    var MergeSpheres = Parse.Object.extend("MergeSpheres");
                    var mergespheresquery = new Parse.Query(MergeSpheres);
                    mergespheresquery.equalTo("motherSphere", sphere1);
                    mergespheresquery.equalTo("childSphere", sphere2);
                    promises2.push(mergespheresquery.first().then(function(mergeralreadyexists){
                        if((typeof mergeralreadyexists == "undefined") || (mergeralreadyexists == "") || (mergeralreadyexists == null)) {
                            var promises3 = new Array();
                            var itemcontent = new Object();
                            var createdAtDate = spheremergerequest.createdAt;
                            itemcontent.createdAt = moment(createdAtDate).unix();
                            var Spheres1 = Parse.Object.extend("Spheres");
                            var spheresquery1 = new Parse.Query(Spheres1);
                            spheresquery1.equalTo("objectId", sphere1);
                            promises3.push(spheresquery1.first().then(function(parentsphere){
                                if((typeof parentsphere == "undefined") || (parentsphere == "")) {
                                   itemcontent.parentSphereID = "undefined";
                                   itemcontent.parentSphereName = "undefined";
                                } else {
                                   itemcontent.parentSphereID = parentsphere.id;
                                   itemcontent.parentSphereName = parentsphere.get("sphereName");
                                }
                                return true;
                            }));
                            var Spheres2 = Parse.Object.extend("Spheres");
                            var spheresquery2 = new Parse.Query(Spheres2);
                            spheresquery2.equalTo("objectId", sphere2);
                            promises3.push(spheresquery2.first().then(function(childsphere){
                                if((typeof childsphere == "undefined") || (childsphere == "")) {
                                    itemcontent.childSphereID = "undefined";
                                    itemcontent.childSphereName = "undefined";
                                } else {
                                    itemcontent.childSphereID = childsphere.id;
                                    itemcontent.childSphereName = childsphere.get("sphereName");
                                }
                                return true;
                            }));
                            adminactionitemsforparentaction.push({"itemtype":"approvemergerequest", "itemcontent": itemcontent});
                            return Parse.Promise.when(promises3);
                         } else {
                             return false;
                         }
                   }));
              });
              return Parse.Promise.when(promises2);
            }
           }));
       });
       return Parse.Promise.when(promises).then(function(){
           return adminactionitemsforparentaction;
       });
    }).then(function(adminactionitemsforparentaction){
         response.success(adminactionitemsforparentaction);
    });
});
Parse.Cloud.define("adminactionitemsforspheremergerstochild", function(request, response) {
   var sphereObjectIDs = request.params.sphereObjectIDs;
   var promise = Parse.Promise.as();
   promise.then(function(){
       var promises = new Array();
       var adminactionitemsforchildaction = new Array();
       _.each(sphereObjectIDs, function(sphereObjectID){
           var MergeRequests = Parse.Object.extend("MergeRequests");
           var mergerequestsquery = new Parse.Query(MergeRequests);
           mergerequestsquery.equalTo("childSphere", sphereObjectID);
           promises.push(mergerequestsquery.find().then(function(spheres){
            if((typeof spheres == "undefined") || (spheres == "")) {
                return false;
            } else {
              var promises2 = new Array();
              _.each(spheres, function(spheremergerequest) {
                    var sphere2 = spheremergerequest.get("childSphere");
                    var MergeSpheres = Parse.Object.extend("MergeSpheres");
                    var mergespheresquery = new Parse.Query(MergeSpheres);
                    mergespheresquery.equalTo("childSphere", sphere2);
                    promises2.push(mergespheresquery.first().then(function(mergeralreadyexists){
                        if((typeof mergeralreadyexists == "undefined") || (mergeralreadyexists == "") || (mergeralreadyexists == null)) {
                            var promises3 = new Array();
                            var itemcontent = new Object();
                            var createdAtDate = spheremergerequest.createdAt;
                            itemcontent.createdAt = moment(createdAtDate).unix();
                            var sphere1 = spheremergerequest.get("motherSphere");
                            var Spheres1 = Parse.Object.extend("Spheres");
                            var spheresquery1 = new Parse.Query(Spheres1);
                            spheresquery1.equalTo("objectId", sphere1);
                            promises3.push(spheresquery1.first().then(function(parentsphere){
                                if((typeof parentsphere == "undefined") || (parentsphere == "")) {
                                   itemcontent.parentSphereID = "undefined";
                                   itemcontent.parentSphereName = "undefined";
                                } else {
                                   itemcontent.parentSphereID = parentsphere.id;
                                   itemcontent.parentSphereName = parentsphere.get("sphereName");
                                }
                            }));
                            var Spheres2 = Parse.Object.extend("Spheres");
                            var spheresquery2 = new Parse.Query(Spheres2);
                            spheresquery2.equalTo("objectId", sphere2);
                            promises3.push(spheresquery2.first().then(function(childsphere){
                                if((typeof childsphere == "undefined") || (childsphere == "")) {
                                    itemcontent.childSphereID = "undefined";
                                    itemcontent.childSphereName = "undefined";
                                } else {
                                    itemcontent.childSphereID = childsphere.id;
                                    itemcontent.childSphereName = childsphere.get("sphereName");
                                }
                            }));
                            adminactionitemsforchildaction.push({"itemtype": "sentmergerequest", "itemcontent": itemcontent});
                            return Parse.Promise.when(promises3);
                        } else {
                            return false;
                        }
                      }));
                   });
                   return Parse.Promise.when(promises2).then(function(){
                        return true;
                   });
                }
           }));
       });
       return Parse.Promise.when(promises).then(function(){
           return adminactionitemsforchildaction;
       });
    }).then(function(adminactionitemsforchildaction){
         response.success(adminactionitemsforchildaction);
    });
});
Parse.Cloud.define("sphereadminsinsphere", function(request, response) {
    var spheres = Parse.Object.extend("Spheres");
    var sphereadminsquery = new Parse.Query(spheres);
    sphereadminsquery.equalTo("objectId", request.params.sphereObjectID);
    sphereadminsquery.first().then(function(sphere){
        response.success(sphere.get("sphereAdmins"));
    });
});
Parse.Cloud.define("sphereadminsinsphereinfo", function(request, response) {
    var spheres = Parse.Object.extend("Spheres");
    var sphereadminsquery = new Parse.Query(spheres);
    sphereadminsquery.equalTo("objectId", request.params.sphereObjectID);
    sphereadminsquery.first().then(function(sphere){
        var sphereAdmins = sphere.get("sphereAdmins");
        var promise2 = Parse.Promise.as();
        return promise2.then(function(){
            var promises2 = new Array();
            var adminsOfsphere = new Array();
            _.each(sphereAdmins, function(sphereAdminID){
                var usersquery = new Parse.Query(Parse.User);
                usersquery.equalTo("pUserID", sphereAdminID);
                promises2.push(usersquery.first().then(function(user){
                  if((typeof user !== "undefined") && (user !== "") && (user !== null)){
                   adminsOfsphere.push({"admin": {
                      "adminpUserID": user.get("pUserID"),
                      "adminName": user.get("name"),
                      "adminfMemberID": user.get("fUserID"),
                      "adminEmail": user.get("email")
                   }});
                 }
                }));
            });
            return Parse.Promise.when(promises2).then(function(){
                return adminsOfsphere;
            });
        }).then(function(adminsofsphere){
            response.success(adminsofsphere);
        });
    });
});
Parse.Cloud.define("spheremembersinsphere", function(request, response) {
    var SphereMembers = Parse.Object.extend("SphereMembers");
    var spheremembersquery = new Parse.Query(SphereMembers);
    spheremembersquery.equalTo("sphereObjectID", request.params.sphereObjectID);
    spheremembersquery.find().then(function(spheremembers){
        var spheremembersarray = new Array();
        var promises = new Array();
       _.each(spheremembers, function(spheremember){
          var spherememberpuserid = spheremember.get("pUserID");
          var membersquery = new Parse.Query(Parse.User);
          membersquery.equalTo("pUserID", spherememberpuserid);
          promises.push(membersquery.first().then(function(member){
            if((typeof member == "undefined") || (member == "") || (member == null)){
              return false;
            } else {
              var spheremembername = member.get("name");
              var fMemberID = member.get("fUserID");
              var email = member.get("email");
              var pUserID = member.get("pUserID");
              var spherememberinfo = {"pUserID": pUserID, "name": spheremembername, "fMemberID": fMemberID, "email": email};
              spheremembersarray.push(spherememberinfo);
            }
          }));
       });
       return Parse.Promise.when(promises).then(function(){
           return spheremembersarray;
       });
    }).then(function(spheremembersarray){
        response.success(spheremembersarray);
    });
});
Parse.Cloud.define("aboutsphere", function(request, response) {
        var sphereID = request.params.sphereID;
        var Spheres = Parse.Object.extend("Spheres");
        var spheresquery = new Parse.Query(Spheres);
        spheresquery.equalTo("objectId", sphereID);
        spheresquery.first().then(function(sphere){
            var sphereName = sphere.get("sphereName");
            var sphereDescription = sphere.get("sphereDescription");
            var spherePrivacy = sphere.get("spherePrivacy");
            var sphereAdmins = sphere.get("sphereAdmins");
            var sphereElectionCreationOptions = sphere.get("sphereElectionCreation");
            var sphereData = [{"sphereID": sphereID, "sphereName": sphereName, "sphereDescription": sphereDescription, "spherePrivacy": spherePrivacy, "sphereAdmins": sphereAdmins, "sphereElectionCreationOptions": sphereElectionCreationOptions}];
            response.success(sphereData);
        });
});
Parse.Cloud.define("conversations", function(request, response) {
        var sphereID = request.params.sphereObjectID;
        var Conversations = Parse.Object.extend("Conversations");
        var conversationsquery = new Parse.Query(Conversations);
        conversationsquery.equalTo("sphereObjectID", sphereID);
        conversationsquery.first().then(function(conversation){
            if((typeof conversation !== "undefined") && (conversation !== "") && (conversation !== null)){
              var conversationID = conversation.id;
              if(messageType == "picture"){
                var PictureMessages = Parse.Object.extend("PictureMessages");
                var picturemessagesquery = new Parse.Query(PictureMessages);
                picturemessagesquery.equalTo("conversationID", conversationID);
                picturemessagesquery.limit(10);
                picturemessagesquery.find().then(function(picturemessages){
                  response.success(picturemessages);
                });
              } else if(messageType == "text"){
                var TextMessages = Parse.Object.extend("TextMessages");
                var textmessagesquery = new Parse.Query(TextMessages);
                textmessagesquery.equalTo("conversationID", conversationID);
                textmessagesquery.limit(10);
                textmessagesquery.find().then(function(textmessages){
                  response.success(textmessages);
                });
              }
            } else {
              response.success(false);
            }
        });
});
Parse.Cloud.define("childSpheres", function(request, response) {
  var falsesarray = new Array();
  var truesarray = new Array();
  var looparray = new Array();
  var childsphereids = request.params.childsphereids;
  var arrayofchildspheres = childsphereids;
  var siblingchildren = [];
  siblingchildren.push(childsphereids.length);
  function buildChildSpheresArray(childsphereid){
    var promises2 = new Array();
    var MergeSpheres = Parse.Object.extend("MergeSpheres");
    var mergespherequery = new Parse.Query(MergeSpheres);
    mergespherequery.equalTo("motherSphere", childsphereid);
    mergespherequery.find().then(function(mergedspheres){
        if((typeof mergedspheres == "undefined") || (mergedspheres == "") || (mergedspheres == null)){
            falsesarray.push(1);
            looparray.push(false);
            return checkAllChecked();
        } else {
            for(var i = 0; i < mergedspheres.length; i++) {
              var mergedsphere = mergedspheres[i];
              var childsphereofid = mergedsphere.get("childSphere");
              arrayofchildspheres.push(childsphereofid);
              buildChildSpheresArray(childsphereofid);
            }
            truesarray.push(1);
            looparray.push(true);
            siblingchildren.push(mergedspheres.length);
            return checkAllChecked();
        }
    });
  };
  function checkAllChecked(){
    var loopnumber = falsesarray.length + truesarray.length;
    var siblingchildrenindexfornumberinlastbatchofchildren = loopnumber - 1;
    var sumsiblingchildren = _.reduce(siblingchildren, function(memo, num){ return memo + num; }, 0);
    var falsescount = new Array();
    var indexoflastbatchofsiblings = siblingchildren.length - 1 || 0;
    var numberinlastbatchofchildren = siblingchildren[indexoflastbatchofsiblings];
    if(loopnumber == sumsiblingchildren){
      for(var i = 0; i < numberinlastbatchofchildren; i++){
        var arrayindex = ((loopnumber - numberinlastbatchofchildren) - 1) + i || 0;
        if(looparray[arrayindex] !== true) {
          falsescount.push(1);
          if(falsescount.length = numberinlastbatchofchildren){
            response.success(arrayofchildspheres);
            return true;
          }
        }
      }
    } else {
      return false;
    }
  };
  if(childsphereids !== false){
    for(var i = 0; i < childsphereids.length; i++) {
      var childsphereid = childsphereids[i];
      buildChildSpheresArray(childsphereid);
    }
  } else {
    response.success(false);
  }
});
Parse.Cloud.define("adminemailtomembersinfo", function(request, response) {
    var sentemailid = request.params.sentemailid;
    if(sentemailid !== "") {
    var sphereObjectID = request.params.sphereObjectID;
    var SphereAdminToMembersEmails = Parse.Object.extend("SphereAdminToMembersEmails");
    var sphereadmintomemberemailsquery = new Parse.Query(SphereAdminToMembersEmails);
    sphereadmintomemberemailsquery.equalTo("objectId", sentemailid);
    sphereadmintomemberemailsquery.equalTo("sphereObjectID", sphereObjectID);
    sphereadmintomemberemailsquery.first().then(function(thissentemail){
        if((typeof thissentemail == "undefined") || (thissentemail == "") || (thissentemail == null)){
         return false;
        } else {
         var listType = thissentemail.get("listType");
         if(listType == "allcurrentmembers"){
             var listtypestring = "All Current Members";  
         } else if(listType == "allinvitedmembers") {
             var listtypestring = "All Invited Members";
         } else if(listType == "alladmins") {
             var listtypestring = "All Admins";
         } else if(listType == "individuals") {
             var listtypestring = "Individuals";
         }
         var fromemail = thissentemail.get("fromemail");
         var fromname = thissentemail.get("fromName");
         var fMemberID = thissentemail.get("fromfMemberID");
         var sentemailsubject = thissentemail.get("subject");
         var sentemailmessage = thissentemail.get("message");
         var sentemailrecipients = thissentemail.get("recipients");
         var sentemaildateobject = thissentemail.createdAt;
         var sentemaildate = moment(sentemaildateobject).unix();
         return [{"fromemail": fromemail, "fromname": fromname, "fromfMemberID":fMemberID, "subject": sentemailsubject, "message": sentemailmessage, "listtype": listtypestring, "datesent": sentemaildate, "recipients": sentemailrecipients}];
        }
    }).then(function(sentemaildetails){
        response.success(sentemaildetails);
    });
    } else {
        response.success(false);
    }
});
Parse.Cloud.define("numberofadminemailstomembersinfo", function(request, response) {
    var sphereObjectID = request.params.sphereObjectID;
    var currentpage = request.params.page;
    var SphereAdminToMembersEmails = Parse.Object.extend("SphereAdminToMembersEmails");
    var sphereadmintomemberemailsquery = new Parse.Query(SphereAdminToMembersEmails);
    sphereadmintomemberemailsquery.equalTo("sphereObjectID", sphereObjectID);
    sphereadmintomemberemailsquery.find().then(function(emails){
        if((typeof emails == "undefined") || (emails == "") || (emails == null) || (emails == 0)){
            response.success({"currentpage": 0, "pages": 0, "nextpage": 2, "previouspage": 0, "previousdisabled": "", "nextdisabled": ""});
        } else {
           var numemails = emails.length;
           var numberofchunks = Math.ceil(numemails / 5);
           var page = parseInt(currentpage) || 1;
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
           if(page <= 1) {
              var previousdisabled = "disabled";
           } else {
              var previousdisabled = "";
           }
           if(page >= numberofchunks) {
             var nextdisabled = "disabled";
           } else {
             var nextdisabled = "";
           }
           response.success({"currentpage": page, "pages": numberofchunks, "nextpage": nextpage, "previouspage": previousPage, "previousdisabled": previousdisabled, "nextdisabled": nextdisabled});
        }
    });
});
Parse.Cloud.define("adminemailstomembersinfo", function(request, response) {
    var sphereObjectID = request.params.sphereObjectID;
    var skipemails = (request.params.page - 1) * 5;
    var SphereAdminToMembersEmails = Parse.Object.extend("SphereAdminToMembersEmails");
    var sphereadmintomemberemailsquery = new Parse.Query(SphereAdminToMembersEmails);
    sphereadmintomemberemailsquery.equalTo("sphereObjectID", sphereObjectID);
    sphereadmintomemberemailsquery.descending("updatedAt");
    sphereadmintomemberemailsquery.limit(5);
    sphereadmintomemberemailsquery.skip(skipemails);
    sphereadmintomemberemailsquery.find().then(function(thissentemails){
        if((typeof thissentemails == "undefined") || (thissentemails == "") || (thissentemails == null)){
         return false;
        } else {
            var sentemailsdetails = new Array();
            _.each(thissentemails, function(thissentemail){
                 var listType = thissentemail.get("listType");
                 var sentemailid = thissentemail.id;
                 if(listType == "allcurrentmembers"){
                     var listtypestring = "All Current Members";  
                 } else if(listType == "allinvitedmembers") {
                     var listtypestring = "All Invited Members";
                 }
                 var fromemail = thissentemail.get("fromemail");
                 var fromname = thissentemail.get("fromName");
                 var fMemberID = thissentemail.get("fromfMemberID");
                 var sentemailsubject = thissentemail.get("subject");
                 var sentemailmessage = thissentemail.get("message");
                 var sentemailsubjectpreview = sentemailsubject.substring(0, 50);
                 var sentemailmessagepreview = sentemailmessage.substring(0, 100);
                 sentemailsdetails.push({"sentemailid":sentemailid, "fromfMemberID": fMemberID, "fromemail": fromemail, "fromname": fromname, "subjectpreview": sentemailsubjectpreview, "messagepreview": sentemailmessagepreview, "listtype": listtypestring});
            });
            return Parse.Promise.when(sentemailsdetails).then(function(){
                return sentemailsdetails;
            });
        }
    }).then(function(sentemailsdetails){
        response.success(sentemailsdetails);
    });
});
Parse.Cloud.define("electionsinsphere", function(request, response) {
   var Elections = Parse.Object.extend('Elections');
   var electionsquery = new Parse.Query(Elections);
   electionsquery.equalTo('sphereObjectID', request.params.sphereObjectID);
   electionsquery.descending("createdAt");
   electionsquery.limit(10);
   electionsquery.find().then(function(elections) {
       if((typeof elections !== "undefined") && (elections !== "") && (elections !== null)) {
           var electionItems = Array();
           for(var i=0; i < elections.length; i++) {
                var election = elections[i];
                var electionName = election.get("electionName");
                var electionType = election.get("electionType");
                var voteOrEval = election.get("voteOrEval");
                var rangeDefinition = election.get("rangeDefinition");
                var electionVotesAllowed = election.get("electionVotesAllowed");
                var electionTotalBudget = election.get("totalBudget");
                var electionID = election.id;
                var electionCreatedAt = election.createdAt;
                var electionCreatedAtUnix = moment(electionCreatedAt).unix();
                var electionEndDate = election.get("endDate");
                var electionEndFormated = moment(electionEndDate).format('L hh:mm a');
                var electionEndDateUnix = moment(electionEndDate).unix();
                var administrator = election.get("fMemberID");
                var votes = election.get("votes");
                var electionDescription = election.get("electionDescription");
                electionItems.push({
                    "electionID": electionID,
                    "electionName": electionName,
                    "electionType": electionType,
                    "voteOrEval": voteOrEval,
                    "rangeDefinition": rangeDefinition,
                    "electionVotesAllowed": electionVotesAllowed,
                    "electionTotalBudget": electionTotalBudget,
                    "electionDescription": electionDescription,
                    "electionCreatedAtUnix": electionCreatedAtUnix,
                    "electionEndDateFormated": electionEndFormated,
                    "electionEndDateUnix": electionEndDateUnix,
                    "admin": administrator,
                    "votes": votes
                });
           }
           response.success(electionItems);
       } else {
           response.success();
       }
   });
});
Parse.Cloud.define("aboutelection", function(request, response) {
   var Elections = Parse.Object.extend('Elections');
   var electionsquery = new Parse.Query(Elections);
   electionsquery.equalTo('objectId', request.params.electionObjectID);
   electionsquery.first().then(function(election) {
       if((typeof election !== "undefined") && (election !== "") && (election !== null)) {
           var electionEndDate = election.get("endDate");
           var electionEndDateUnix = moment(electionEndDate).unix();
           var electionItem = {
               "electionName": election.get("electionName"),
               "electionAdmin": election.get("pUserID"),
               "electionType": election.get("electionType"),
               "nomineeLimitedToMembers": election.get("nomineeLimitedToMembers"),
               "voteOrEval": election.get("voteOrEval"),
               "votesCast": election.get("votes"),
               "rangeDefinition": election.get("rangeDefinition"),
               "electionDescription": election.get("electionDescription"),
               "electionVotesAllowed": election.get("electionVotesAllowed"),
               "totalBudget": election.get("totalBudget"),
               "commentsOnElectionAllowed": election.get("commentsAllowed"),
               "endDate": electionEndDateUnix};
           response.success(electionItem);
       } else {
           response.error("election not defined");
       }
   });
});
Parse.Cloud.define("nominationsinelection", function(request, response) {
   var Elections = Parse.Object.extend("Elections");
   var electionsquery = new Parse.Query(Elections);
   electionsquery.equalTo("objectId", request.params.electionObjectID);
   electionsquery.first().then(function(election){
       var voteoreval = election.get("voteOrEval");
       if(voteoreval == "vote"){
           var sortmethod = "votes";
       } else if(voteoreval == "evaluation") {
           var sortmethod = "avgEvaluation";
       } else if(voteoreval == "allocation") {
           var sortmethod = "avgEvaluation";
       }
       return sortmethod;
   }).then(function(sortmethod){
       var Nominations = Parse.Object.extend('Nominations');
       var nominationsquery = new Parse.Query(Nominations);
       nominationsquery.equalTo('electionID', request.params.electionObjectID);
       nominationsquery.descending(sortmethod);
       nominationsquery.find().then(function(nominations) {
           if((typeof nominations !== "undefined") && (nominations !== "") && (nominations !== null)) {
               var nominationItems = Array();
               for(var i=0; i < nominations.length; i++) {
                    var nomination = nominations[i];
                    var nominationName = nomination.get("pageName");
                    var nominationID = nomination.id;
                    var votes = nomination.get("votes");
                    var voters = nomination.get("voters");
                    var avgevaluation = nomination.get("avgEvaluation");
                    nominationItems.push({"nominationID": nominationID, "nominationName": nominationName, "votes": votes, "voters": voters, "avgevaluation": avgevaluation});
               }
               response.success(nominationItems);
           } else {
               response.error("nominations do not exist");
           }
       });
   });
});
Parse.Cloud.define("nominationvoterecord", function(request, response) {
    var nominationObjectID = request.params.nominationObjectID;
    var electionObjectID = request.params.electionObjectID;
    var sphereObjectID = request.params.sphereObjectID;
    var Votes = Parse.Object.extend("Votes");
    var votesquery = new Parse.Query(Votes);
    votesquery.equalTo("nominationObjectID", nominationObjectID);
    votesquery.equalTo("electionObjectID", electionObjectID);
    votesquery.equalTo("sphereObjectID", sphereObjectID);
    votesquery.find().then(function(votesfornomination){
       var nominationvoterecord = new Array();
       _.each(votesfornomination, function(vote){
           var votescast = vote.get("votes");
           var createdAtUnformatted = vote.createdAt;
           var createdAt = moment(createdAtUnformatted).unix();
           nominationvoterecord.push({"votescast": votescast, "createdAt": createdAt});
       });
       response.success(nominationvoterecord);
    });
});
Parse.Cloud.define("spheresiblings", function(request, response) {
    var sphereObjectID = request.params.sphereObjectID;
    var MergeSpheres = Parse.Object.extend("MergeSpheres");
    var parentspherequery = new Parse.Query(MergeSpheres);
    parentspherequery.equalTo("childSphere", sphereObjectID);
    parentspherequery.first().then(function(thissphere){
        if((typeof thissphere == "undefined") || (thissphere == "") || (thissphere == null)) {
            return false;
        } else {
            return thissphere;
        }
    }).then(function(thissphere){
        if(thissphere === false) {
            response.success([]); 
            return false;
        } else {
            var mothersphere = thissphere.get("motherSphere");
            var thissphereid = thissphere.get("childSphere");
            var MergeSpheres = Parse.Object.extend("MergeSpheres");
            var childspherequery = new Parse.Query(MergeSpheres);
            childspherequery.equalTo("motherSphere", mothersphere);
            childspherequery.notEqualTo("childSphere", thissphereid);
            childspherequery.find().then(function(spheres){
                if((typeof spheres == "undefined") || (spheres == "") || (spheres == null)) {
                    return false;
                } else {
                    var promises = new Array();
                    var siblingspheres = new Array();
                    _.each(spheres, function(childsphere){
                       var childsphereid = childsphere.get("childSphere");
                       var Spheres = Parse.Object.extend("Spheres");
                       var spheresquery = new Parse.Query(Spheres);
                       spheresquery.equalTo("objectId", childsphereid);
                       promises.push(spheresquery.first().then(function(sphere){
                           var spherename = sphere.get("sphereName");
                           siblingspheres.push({"sphereObjectID": sphere.id, "sphereName": spherename}); 
                       }));
                    });
                    return Parse.Promise.when(promises).then(function(){
                        return siblingspheres;
                    });
                }
            }).then(function(siblingspheres){
                if(siblingspheres === false) {
                    response.success([]);
                } else {
                    response.success(siblingspheres);
                    return true;
                }
            });
        }
    });
});
Parse.Cloud.define("spherechildren", function(request, response) {
    var sphereObjectID = request.params.sphereObjectID;
    var MergeSpheres = Parse.Object.extend("MergeSpheres");
    var childspherequery = new Parse.Query(MergeSpheres);
    childspherequery.equalTo("motherSphere", sphereObjectID);
    childspherequery.find().then(function(spheres){
        if((typeof spheres == "undefined") || (spheres == "") || (spheres == null)){
            return false;
        } else {
             var childspheres = new Array();
             var promises = new Array();
            _.each(spheres, function(parentsphere){
               var childsphereid = parentsphere.get("childSphere");
               var Spheres = Parse.Object.extend("Spheres");
               var spheresquery = new Parse.Query(Spheres);
               spheresquery.equalTo("objectId", childsphereid);
               promises.push(spheresquery.first().then(function(sphere){
                   var spherename = sphere.get("sphereName");
                   childspheres.push({"sphereObjectID": sphere.id, "sphereName": spherename}); 
               }));
            });
           return Parse.Promise.when(promises).then(function(){
               return childspheres;
           });
        }
    }).then(function(childspheres){
        if(childspheres == false){
            response.success([]);
        } else {
            response.success(childspheres);
        }
    });
});
Parse.Cloud.define("sphereparent", function(request, response) {
    var sphereObjectID = request.params.sphereObjectID;
    var MergeSpheres = Parse.Object.extend("MergeSpheres");
    var parentspherequery = new Parse.Query(MergeSpheres);
    parentspherequery.equalTo("childSphere", sphereObjectID);
    parentspherequery.first().then(function(childsphere){
        if((typeof childsphere == "undefined") || (childsphere == "") || (childsphere == null)){
            response.success(false);
            return false;
        } else {
            var parentsphereid = childsphere.get("motherSphere");
            var Spheres = Parse.Object.extend("Spheres");
            var spheresquery = new Parse.Query(Spheres);
            spheresquery.equalTo("objectId", parentsphereid);
            spheresquery.first().then(function(sphere){
               var spherename = sphere.get("sphereName");
               response.success({"sphereObjectID": sphere.id, "sphereName": spherename});
            });
        }
    });
});
Parse.Cloud.define("sphereobjects", function(request, response) {
    var toLowerCase = function(w) { return w.toLowerCase(); };
    var pagenamestring = request.params.pagename;
    var pagenamearray = pagenamestring.match(/\S+/g);
    var pagename = _.map(pagenamearray, toLowerCase);
    var spheres = Parse.Object.extend("Spheres");
    var spheresquery = new Parse.Query(spheres);
    spheresquery.containsAll("searchNameWords", pagename);
    spheresquery.limit(10);
    spheresquery.find().then(function(spheres){
        var pageItems = new Array();
        _.each(spheres, function(sphere){
            var pageID = sphere.id;
            var pageName = sphere.get("sphereName");
            var pageDescription = sphere.get("sphereDescription");
            var pageItem = {"sphereID": pageID, "sphereName": pageName, "sphereDescription": pageDescription};
            pageItems.push(pageItem);;
        });
        return pageItems;
    }).then(function(pageItems){
        response.success(pageItems);
    });
});
Parse.Cloud.define("nominationobjects", function(request, response) {
    var pagename = request.params.pagename;
    var pagenamewithoutspaces = pagename.replace(/ /g,'');
    Parse.Cloud.httpRequest({
      url: "https://graph.facebook.com/"+pagenamewithoutspaces+"/picture",
      params: {
        width: 200,
        redirect : false,
        access_token : request.params.accesstoken,
      },
      success: function(httpResponse) {
        return httpResponse;
      },
      error: function(httpResponse) {
          return "";
      }
     }).then(function(pictureResponse){
         var pagePicture = pictureResponse.data.data.url
         Parse.Cloud.httpRequest({
              url: "https://graph.facebook.com/"+pagenamewithoutspaces,
              params: {
                access_token : request.params.accesstoken,
              },
              success: function(httpResponse) {
                var pageDescription = httpResponse.data.about || "";
                var pageID = httpResponse.data.id;
                var pageName = httpResponse.data.name;
                if(typeof pageID !== "undefined") {
                    var pageItem = {"fPageID": pageID, "pageName": pageName, "pictureURL": pagePicture, "pageDescription": pageDescription};
                    response.success(pageItem);
                }
              },
              error: function(httpResponse) {
              }
        });
     });
});
Parse.Cloud.define("aboutnomination", function(request, response) {
   var Nominations = Parse.Object.extend("Nominations");
   var nominationsquery = new Parse.Query(Nominations);
   nominationsquery.equalTo("objectId", request.params.nominationObjectID);
   nominationsquery.first().then(function(nomination) {
         var nominationItem = new Object(); 
         nominationItem.pageName = nomination.get("pageName");
         nominationItem.nominationDescription = nomination.get("nominationDescription");
         nominationItem.commentsOnNominationAllowed = nomination.get("allowComments");
         nominationItem.votes = nomination.get("votes");
         nominationItem.pUserID = nomination.get("pUserID");
         response.success(nominationItem);
   });
});
Parse.Cloud.define("numberofindividualswhoevaluatednomination", function(request, response) {
   var Votes = Parse.Object.extend("Votes");
   var votesquery = new Parse.Query(Votes);
   votesquery.equalTo("nominationObjectID", request.params.nominationObjectID);
   votesquery.find().then(function(individualvotedfornomination) {
         var tallyindividualswhovotesarray = new Array(); 
         _.each(individualvotedfornomination, function(tallyavote){
            tallyindividualswhovotesarray.push(1); 
         });
         var individualstally = tallyindividualswhovotesarray.length;
         response.success(individualstally);
   });
});
Parse.Cloud.define("userphotos", function(request, response) {
    var pageObjectID = request.params.pUserID;
    var Pictures = Parse.Object.extend("UserPictures");
    var picturesquery = new Parse.Query(Pictures);
    picturesquery.equalTo("pageObjectID", pageObjectID);
    picturesquery.find().then(function(pictures){
          var pictureurls = Array();
          _.each(pictures, function(picture){
             var pictureid = picture.id;
             var picturefile = picture.get("picture");
             var pictureurl = picturefile.url();
             var thumbnail = picture.get("thumbnail");
             var thumbnailurl = thumbnail.url();
             pictureurls.push({"pictureid": pictureid, "pictureurl": pictureurl, "thumbnailurl": thumbnailurl});
          });
          return pictureurls;
   }).then(function(userphotos){
       if(userphotos.length <= 0){
           var pictureurls = 0;
       } else {
           pictureurls = userphotos;
       }
       response.success(pictureurls);
   });
});
Parse.Cloud.define("spherePhotos", function(request, response) {
    var pageObjectID = request.params.sphereObjectID;
    var SpherePictures = Parse.Object.extend("SpherePictures");
    var spherepicturesquery = new Parse.Query(SpherePictures);
    spherepicturesquery.equalTo("pageObjectID", pageObjectID);
    spherepicturesquery.find().then(function(pictures){
        var pictureurls = new Array();
        if((typeof pictures == "undefined") || (pictures == "") || (pictures == null)){
             pictureurls.push({"pictureid": null, "pictureurl": null, "thumbnailurl": null});
        } else {
          _.each(pictures, function(picture){
             var pictureid = picture.id;
             var picturefile = picture.get("picture");
             var pictureurl = picturefile.url();
             var thumbnail = picture.get("thumbnail");
             var thumbnailurl = thumbnail.url();
             pictureurls.push({"pictureid": pictureid, "pictureurl": pictureurl, "thumbnailurl": thumbnailurl});
          });
        }
      return Parse.Promise.when(pictureurls).then(function(){
          return pictureurls;
      });
   }).then(function(pictureurls){
       response.success(pictureurls);
   });
});
Parse.Cloud.define("userprofilepicture", function(request, response) {
    var pageObjectID = request.params.pageObjectID;
    var pageType = request.params.pageType;
    var ProfilePictures = Parse.Object.extend("ProfilePictures");
    var profilepicturesquery = new Parse.Query(ProfilePictures);
    profilepicturesquery.equalTo("pageType", pageType);
    profilepicturesquery.equalTo("pageObjectID", pageObjectID);
    profilepicturesquery.first().then(function(picture){
        if((typeof picture == "undefined") || (picture == "")){
            return false;
        } else {
             var pictureid = picture.get("pictureObjectID");
             return pictureid;
        }
   }).then(function(pictureid){
       if(pictureid == false) {
           var profilepic = new Array();
           var promises = new Array();
           var UserPictures = Parse.Object.extend("UserPictures");
           var userpicturesquery = new Parse.Query(UserPictures);
           userpicturesquery.equalTo("pageObjectID", pageObjectID);
           promises.push(userpicturesquery.first().then(function(userpicture){
               if((typeof userpicture == "undefined") || (userpicture == "") || (userpicture == null)){
                   profilepic.push({"pictureurl": null, "thumbnailurl": null});
               } else {
                   var userpicturefile = userpicture.get("picture");
                   var userpictureurl = userpicturefile.url();
                   var userthumbnailfile = userpicture.get("thumbnail");
                   var userthumbnailurl = userthumbnailfile.url();
                   profilepic.push({"pictureurl": userpictureurl, "thumbnailurl": userthumbnailurl});
               }
           }));
           return Parse.Promise.when(promises).then(function(){
               return profilepic;
           });
       } else {
           var profilepic = new Array();
           var promises = new Array();
           var UserPictures = Parse.Object.extend("UserPictures");
           var userpicturesquery = new Parse.Query(UserPictures);
           userpicturesquery.equalTo("pageObjectID", pageObjectID);
           userpicturesquery.equalTo("objectId", pictureid);
           promises.push(userpicturesquery.first().then(function(profilepicture){
              if((typeof profilepicture == "undefined") || (profilepicture == "") || (profilepicture == null)){
                  profilepic.push({"pictureurl": null, "thumbnailurl": null});
              } else {
                  var picturefile = profilepicture.get("picture");
                  var pictureurl = picturefile.url();
                  var thumbnailfile = profilepicture.get("thumbnail");
                  var thumbnailurl = thumbnailfile.url();
                  profilepic.push({"pictureurl": pictureurl, "thumbnailurl": thumbnailurl});
              }
           }));
           return Parse.Promise.when(promises).then(function(){
               return profilepic;
           });
       }
   }).then(function(profilepic){
       if(profilepic.pictureurl !== null){
           response.success(profilepic);
       } else {
           response.success({"pictureurl": null, "thumbnailurl": null});
       }
   });
});
Parse.Cloud.define("profilePicture", function(request, response) {
    var pageObjectID = request.params.pageObjectID;
    var pictureClass = request.params.pictureClass;
    var pageType = request.params.pageType;
    var ProfilePictures = Parse.Object.extend("ProfilePictures");
    var profilepicturesquery = new Parse.Query(ProfilePictures);
    profilepicturesquery.equalTo("pageType", pageType);
    profilepicturesquery.equalTo("pageObjectID", pageObjectID);
    profilepicturesquery.first().then(function(picture){
        if((typeof picture == "undefined") || (picture == "")){
            return false;
        } else {
             var pictureid = picture.get("pictureObjectID");
             return pictureid;
        }
   }).then(function(pictureid){
       if(pictureid == false) {
           response.success([{"pictureurl": null, "thumbnailurl": null}]);
       } else {
           var SpherePictures = Parse.Object.extend(pictureClass);
           var spherepicturesquery = new Parse.Query(SpherePictures);
           spherepicturesquery.equalTo("pageObjectID", pageObjectID);
           spherepicturesquery.equalTo("objectId", pictureid);
           spherepicturesquery.first().then(function(profilepicture){
              var picturefile = profilepicture.get("picture");
              var pictureurl = picturefile.url();
              var thumbnailfile = profilepicture.get("thumbnail");
              var thumbnailurl = thumbnailfile.url();
              var profilepic = [{"pictureurl": pictureurl, "thumbnailurl": thumbnailurl}];
              response.success(profilepic);
           });
       }
   });
});
Parse.Cloud.define("electionPhotos", function(request, response) {
    var pageObjectID = request.params.electionObjectID;
    var ElectionPictures = Parse.Object.extend("ElectionPictures");
    var electionpicturesquery = new Parse.Query(ElectionPictures);
    electionpicturesquery.equalTo("pageObjectID", pageObjectID);
    electionpicturesquery.find().then(function(pictures){
          var pictureurls = Array();
          _.each(pictures, function(picture){
             var pictureid = picture.id;
             var picturefile = picture.get("picture");
             var pictureurl = picturefile.url();
             var thumbnail = picture.get("thumbnail");
             var thumbnailurl = thumbnail.url();
             pictureurls.push({"pictureid": pictureid, "pictureurl": pictureurl, "thumbnailurl": thumbnailurl});
          });
          return pictureurls;
   }).then(function(pictureurls){
       response.success(pictureurls);
   });
});
Parse.Cloud.define("nominationPhotos", function(request, response) {
    var pageObjectID = request.params.nominationObjectID;
    var Pictures = Parse.Object.extend("Pictures");
    var picturesquery = new Parse.Query(Pictures);
    picturesquery.equalTo("pageObjectID", pageObjectID);
    picturesquery.find().then(function(pictures){
          var pictureurls = Array();
          _.each(pictures, function(picture){
             var pictureid = picture.id;
             var picturefile = picture.get("picture");
             var pictureurl = picturefile.url();
             var thumbnail = picture.get("thumbnail");
             var thumbnailurl = thumbnail.url();
             pictureurls.push({"pictureid": pictureid, "pictureurl": pictureurl, "thumbnailurl": thumbnailurl});
          });
          return pictureurls;
   }).then(function(pictureurls){
       response.success(pictureurls);
   });
});
Parse.Cloud.define("backgroundPicture", function(request, response) {
    var pageObjectID = request.params.pageObjectID;
    var pageType = request.params.pageType;
    var BackgroundPictures = Parse.Object.extend("BackgroundPictures");
    var backgroundpicturesquery = new Parse.Query(BackgroundPictures);
    backgroundpicturesquery.equalTo("pageObjectID", pageObjectID);
    backgroundpicturesquery.equalTo("pageType", pageType);
    backgroundpicturesquery.first().then(function(picture){
        if((typeof picture == "undefined") || (picture == "") || (picture == null)){
         return [{"pictureid": null, "backgroundpictureurl": null}]; 
        } else {
         var pictureid = picture.id;
         var backgroundpicture = picture.get("backgroundimage");
         var backgroundpictureurl = backgroundpicture.url();
         return [{"pictureid": pictureid, "backgroundpictureurl": backgroundpictureurl}];
        }
   }).then(function(pictureurl){
       response.success(pictureurl);
   });
});
Parse.Cloud.define("totaluservotescastinelection", function(request, response) {
    var VotesCast = Parse.Object.extend("Votes");
    var uservotescastquery = new Parse.Query(VotesCast);
    uservotescastquery.equalTo("sphereObjectID", request.params.sphereObjectID);
    uservotescastquery.equalTo("electionObjectID", request.params.electionObjectID);
    uservotescastquery.equalTo("pUserID", request.params.pUserID);
    uservotescastquery.find().then(function(uservotescast){
        var arrayofvotesspent = [];
        _.each(uservotescast, function(uservotecast){
            var votescastforvote = uservotecast.get("votes");
            arrayofvotesspent.push(votescastforvote);
        });
        if(arrayofvotesspent.length > 0) {
            var totalvotesspent = _.reduce(arrayofvotesspent, function(memo, num){ return memo + num; }, 0);
        } else {
            var totalvotesspent = 0;
        }
        response.success(totalvotesspent);
    });
});
Parse.Cloud.define("uservotescastinelection", function(request, response) {
    var VotesCast = Parse.Object.extend("Votes");
    var uservotescastquery = new Parse.Query(VotesCast);
    uservotescastquery.equalTo("sphereObjectID", request.params.sphereObjectID);
    uservotescastquery.equalTo("electionObjectID", request.params.electionObjectID);
    uservotescastquery.equalTo("pUserID", request.params.pUserID);
    uservotescastquery.find().then(function(uservotescast){
        var arrayofvotesspent = [];
        _.each(uservotescast, function(uservotecast){
            var pagename = uservotecast.get("pageName");
            var nominationObjectID = uservotecast.get("nominationObjectID");
            var votes = uservotecast.get("votes");
            arrayofvotesspent.push({"pageName": pagename, "nominationObjectID": nominationObjectID, "votes": votes});
        });
        return arrayofvotesspent;
    }).then(function(arrayofvotesspent){
        response.success(arrayofvotesspent);
    });
});
Parse.Cloud.define("usercastvotefornomination", function(request, response) {
    var VotesCast = Parse.Object.extend("Votes");
    var uservotescastquery = new Parse.Query(VotesCast);
    uservotescastquery.equalTo("sphereObjectID", request.params.sphereObjectID);
    uservotescastquery.equalTo("electionObjectID", request.params.electionObjectID);
    uservotescastquery.equalTo("nominationObjectID", request.params.nominationObjectID);
    uservotescastquery.equalTo("pUserID", request.params.pUserID);
    uservotescastquery.first().then(function(result){
        if((typeof result == "undefined") || (result === null) || (result == "") || (result == 0)) {
            var userVoteAlreadyCast = Object({"status": false, "pageName": false, "nominationObjectID": 0, "votesAlreadyCast": 0, "voteObjectID": 0});
        } else {
            var userVoteAlreadyCast = Object({"status": true, "pageName": result.get("pageName"), "nominationObjectID": result.get("nominationObjectID"), "votesAlreadyCast": result.get("votes"), "voteObjectID": result.id});
        }
        response.success(userVoteAlreadyCast);
    });
});
Parse.Cloud.define("activeuservotescast", function(request, response) {
    var nowdatetime = new Date();
    var Votes = Parse.Object.extend("Votes");
    var votesquery = new Parse.Query(Votes);
    votesquery.equalTo("pUserID", request.params.pUserID);
    votesquery.greaterThan("electionEndDate", nowdatetime);
    votesquery.find().then(function(uservotes){
        var votes = new Array();
        var promises = new Array();
        _.each(uservotes, function(uservote){
            var sphereName = uservote.get("sphereName");
            var sphereObjectID = uservote.get("sphereObjectID");
            var nominationObjectID = uservote.get("nominationObjectID");
            var voteObjectID = uservote.id;
            var nominationName = uservote.get("pageName");
            var numberofvotes = uservote.get("votes");
            var voteoreval = uservote.get("voteOrEval");
            var rangedefinition = uservote.get("rangeDefinition");
            var nominationDescription = uservote.get("nominationDescription");
            var electionObjectID = uservote.get("electionObjectID");
            var electionName = uservote.get("electionName");
            var electionDescription = uservote.get("electionDescription");
            var electionEndDate = uservote.get("electionEndDate");
            var voteUpdateAt = uservote.updatedAt;
            var Spheres = Parse.Object.extend("Spheres");
            var spheresquery = new Parse.Query(Spheres);
            spheresquery.equalTo("objectId", sphereObjectID);
            promises.push(spheresquery.first().then(function(sphere){
                if((typeof sphere == "undefined") || (sphere == "") || (sphere == null)){
                    return false;
                } else {
                    var promises2 = new Array();
                    var Elections = Parse.Object.extend("Elections");
                    var electionsquery = new Parse.Query(Elections);
                    electionsquery.equalTo("objectId", electionObjectID);
                    promises2.push(electionsquery.first().then(function(election){
                       if((typeof election == "undefined") || (election == "") || (election == null)){
                           return false;
                       } else {
                           var activeUserVote = {
                                "sphereObjectID": sphereObjectID,
                                "sphereName": sphereName,
                                "electionObjectID": electionObjectID,
                                "electionName": electionName,
                                "electionDescription": electionDescription,
                                "nominationObjectID": nominationObjectID,
                                "voteObjectID": voteObjectID,
                                "votes": numberofvotes,
                                "voteoreval": voteoreval,
                                "rangedefinition": rangedefinition,
                                "nominationName": nominationName,
                                "nominationDescription": nominationDescription,
                                "electionEndDate": electionEndDate,
                                "updatedAt": voteUpdateAt
                            };
                           votes.push(activeUserVote);
                           return true;
                       }
                    }));
                    return Parse.Promise.when(promises2).then(function(){
                        return true;
                    });
                }
            }));
        });
        return Parse.Promise.when(promises).then(function(){
            return votes;
        });
    }).then(function(votes){
        response.success(votes);
    });
});
Parse.Cloud.define("returnElectionNotifications", function(request, response) {
      var fUserID = request.params.fUserID;
      var spheres = request.params.sphereObjectIDs;
      Parse.Promise.as().then(function(){
          return spheres;
      }).then(function(spheres){
          var electionObjects = Array();
          for(var i=0; i < spheres.length; i++) {
              var sphere = spheres[i];
              var sphereObjectID = sphere;
              var Elections = Parse.Object.extend("Elections");
              var electionsquery = new Parse.Query(Elections);
              electionsquery.descending("createdAt");
              electionsquery.limit(10);
              electionsquery.equalTo("sphereObjectID", sphereObjectID);
              electionObjects.push(electionsquery.find().then(function(results){
                      var elections = Array();
                      _.each(results, function(election) {
                            elections.push(election);
                      });
                      return elections;
              }));
          }
          return Parse.Promise.when(electionObjects).then(function(){
            return electionObjects;
          });
      }).then(function(elections){
            var electionNotifications = Array();
            for(var i=0; i < elections.length; i++) {
                  var electionObject = elections[i];
                  var electionResultObject = electionObject._result;
                  _.each(electionResultObject, function(electionArray) {
                      if((typeof electionArray != "undefined") && (electionArray != "") && (electionArray !== null)) {
                          for(var i2=0; i2 < electionArray.length; i2++) {
                              var election = electionArray[i2];
                              electionNotifications.push(election);
                          }
                        }
                    });
            }
            return electionNotifications;
    }).then(function(electionNotifications){
        var notifications = Array();
        for(var i=0; i < electionNotifications.length; i++){
              var election = electionNotifications[i];
              var electionID = election.id;
              var electionCreatedAt = election.createdAt;
              var sphereObjectID = election.get("sphereObjectID");
              var electionName = election.get("electionName");
              var electionEndDate = election.get("endDate");
              var electionEndDateUnix = moment(electionEndDate).unix();
              var unixDate = moment(electionCreatedAt).unix();
              notifications.push({
                  "unixDate": unixDate,
                  "notificationType": "election",
                  "sphereObjectID": sphereObjectID,
                  "electionID": electionID,
                  "electionName":electionName,
                  "electionEndDateUnix": electionEndDateUnix
              });
        }
        return notifications;
    }).then(function(notifications){
          response.success(notifications);
    }, function(error){
          response.error("Adding elections to notifications failed. ");
    });
});
Parse.Cloud.define("returnNominationNotifications", function(request, response) {
      var pUserID = request.params.pUserID;
      var spheres = request.params.sphereObjectIDs;
      Parse.Promise.as().then(function(){
          var nominationobjectswithvotes = new Array();
          var electionObjects = new Array();
          for(var i=0; i < spheres.length; i++) {
              var sphere = spheres[i];
              var sphereObjectID = sphere;
              var Elections = Parse.Object.extend("Elections");
              var electionsquery = new Parse.Query(Elections);
              electionsquery.equalTo("sphereObjectID", sphereObjectID);
              electionsquery.descending("createdAt");
              electionsquery.limit(10);
              electionObjects.push(electionsquery.find().then(function(results){
                 var nominations = new Array();
                 _.each(results, function(election) {
                      var electionID = election.id;
                      var sphereObjectID = election.get("sphereObjectID");
                      var electionEndDate = election.get("endDate");
                      var electionName = election.get("electionName");
                      var electionEndDateUnix = moment(electionEndDate).unix();
                      var Nominations = Parse.Object.extend("Nominations");
                      var nominationsquery = new Parse.Query(Nominations);
                      nominationsquery.equalTo("electionID", electionID);
                      nominationsquery.descending("createdAt");
                      nominationsquery.limit(10);
                      nominations.push(nominationsquery.find().then(function(nominationobjects) {
                        var promises = new Array();
                        var nominationobjectsobject = {"electionObjectID": electionID, "electionName": electionName, "sphereObjectID": sphereObjectID, "electionEndDateUnix": electionEndDateUnix, "nominations": nominationobjects};
                        var votescast = new Array();
                        var Votes = Parse.Object.extend("Votes");
                        var votesquery = new Parse.Query(Votes);
                        votesquery.equalTo("sphereObjectID", sphereObjectID);
                        votesquery.equalTo("electionObjectID", electionID);
                        votesquery.equalTo("pUserID", pUserID);
                        promises.push(votesquery.find().then(function(votes){
                            if((typeof votes == "undefined") || (votes == "") || (votes == null)){
                                return false;
                            } else {
                                votescast.push(votes);
                                return true
                            }
                        }));
                        return Parse.Promise.when(promises).then(function(){
                             if(votescast.length <= 0){
                                var votesinelection = false;
                             } else {
                                 var votesinelection = votescast;
                             }
                             var nominationobjectwithvotesobject = {"election": nominationobjectsobject, "votesinelection": votesinelection};
                             nominationobjectswithvotes.push(nominationobjectwithvotesobject);
                        });
                  }));
                });
                return Parse.Promise.when(nominations);
              }));
          }
          return Parse.Promise.when(electionObjects).then(function(){
            return nominationobjectswithvotes;
          });
      }).then(function(notifications){
          response.success(notifications);
      }, function(error){
          response.error("Adding elections to notifications failed. ");
      });
});
Parse.Cloud.define("returnDecisionNotifications", function(request, response) {
      var fUserID = request.params.fUserID;
      var spheres = request.params.sphereObjectIDs;
      var now = new Date();
      Parse.Promise.as().then(function(){
          return spheres;
      }).then(function(spheres){
          var electionObjects = Array();
          for(var i=0; i < spheres.length; i++) {
              var sphere = spheres[i];
              var sphereObjectID = sphere;
              var Elections = Parse.Object.extend("Elections");
              var electionsquery = new Parse.Query(Elections);
              electionsquery.lessThan("endDate", now);
              electionsquery.ascending("endDate");
              electionsquery.limit(10);
              electionsquery.equalTo("sphereObjectID", sphereObjectID);
              electionObjects.push(electionsquery.find().then(function(results){
                      var elections = Array();
                      _.each(results, function(election) {
                            elections.push(election);
                      });
                      return elections;
              }));
          }
          return Parse.Promise.when(electionObjects).then(function(){
            return electionObjects;
          });
      }).then(function(elections){
            var electionNotifications = Array();
            for(var i=0; i < elections.length; i++) {
                  var electionObject = elections[i];
                  var electionResultObject = electionObject._result;
                  _.each(electionResultObject, function(electionArray) {
                      if((typeof electionArray != "undefined") && (electionArray != "") && (electionArray !== null)) {
                          for(var i2=0; i2 < electionArray.length; i2++) {
                              var election = electionArray[i2];
                              electionNotifications.push(election);
                          }
                        }
                    });
            }
            return electionNotifications;
    }).then(function(electionNotifications){
        var notifications = Array();
        for(var i=0; i < electionNotifications.length; i++){
              var election = electionNotifications[i];
              var electionID = election.id;
              var electionCreatedAt = election.createdAt;
              var sphereObjectID = election.get("sphereObjectID");
              var electionName = election.get("electionName");
              var voteOrEval = election.get("voteOrEval");
              var electionEndDate = election.get("endDate");
              var unixDate = moment(electionEndDate).unix();
              notifications.push({
                  "unixDate": unixDate,
                  "notificationType": "election",
                  "sphereObjectID": sphereObjectID,
                  "electionID": electionID,
                  "electionName":electionName,
                  "voteOrEval": voteOrEval,
                  "electionEndDate": electionEndDate
              });
        }
        return notifications;
    }).then(function(notifications){
          var decisions = new Array();
          var promises = new Array();
          Parse.Promise.as().then(function(){
          _.each(notifications, function(notification){
              if (notification.voteOrEval == "evaluation") {
                  var sortmethod = "avgEvaluation";
              } else {
                  var sortmethod = "votes";
              }
              var Nominations = Parse.Object.extend("Nominations");
              var nominationsquery = new Parse.Query(Nominations);
              nominationsquery.equalTo("electionID", notification.electionID);
              nominationsquery.descending(sortmethod);
              nominationsquery.limit(1);
              promises.push(nominationsquery.first().then(function(nomination){
                  if((typeof nomination == "undefined") || (nomination == "")) {
                      decisions.push({
                        "electiondetails": notification,
                          "nominationdetails": {
                          "nominationObjectID": "#",
                          "nominationName": "No One",
                          "nominationDescription": "No One Was Nominated"
                      }}); 
                  } else {
                  decisions.push({
                      "electiondetails": notification,
                      "nominationdetails": {
                          "nominationObjectID": nomination.id,
                          "nominationName": nomination.get("pageName"),
                          "nominationDescription": nomination.get("nominationDescription")
                      }});
                  }
              }));
          });
          return Parse.Promise.when(promises).then(function(){
              return decisions;
          });
          }).then(function(decisions){
            response.success(decisions);
          });
    }, function(error){
          response.error("Adding decision notifications failed. ");
    });
});
Parse.Cloud.define("numDecisionNotifications", function(request, response) {
      var fUserID = request.params.fUserID;
      var spheres = request.params.sphereObjectIDs;
      var now = new Date();
      Parse.Promise.as().then(function(){
          return spheres;
      }).then(function(spheres){
          var electionObjects = Array();
          for(var i=0; i < spheres.length; i++) {
              var sphere = spheres[i];
              var sphereObjectID = sphere;
              var Elections = Parse.Object.extend("Elections");
              var electionsquery = new Parse.Query(Elections);
              electionsquery.lessThan("endDate", now);
              electionsquery.limit(10);
              electionsquery.equalTo("sphereObjectID", sphereObjectID);
              electionObjects.push(electionsquery.find().then(function(results){
                      var elections = Array();
                      _.each(results, function(election) {
                            elections.push(election);
                      });
                      return elections;
              }));
          }
          return Parse.Promise.when(electionObjects).then(function(){
            return electionObjects;
          });
      }).then(function(elections){
            var electionNotifications = Array();
            for(var i=0; i < elections.length; i++) {
                  var electionObject = elections[i];
                  var electionResultObject = electionObject._result;
                  _.each(electionResultObject, function(electionArray) {
                      if((typeof electionArray != "undefined") && (electionArray != "") && (electionArray !== null)) {
                          for(var i2=0; i2 < electionArray.length; i2++) {
                              var election = electionArray[i2];
                              electionNotifications.push(election);
                          }
                        }
                    });
            }
            return electionNotifications;
    }).then(function(electionNotifications){
        var notifications = Array();
        for(var i=0; i < electionNotifications.length; i++){
              var election = electionNotifications[i];
              var electionID = election.id;
              notifications.push({
                  "electionID": electionID
              });
        }
        return notifications;
    }).then(function(notifications){
          var decisions = new Array();
          var promises = new Array();
          Parse.Promise.as().then(function(){
          _.each(notifications, function(notification){
              var Nominations = Parse.Object.extend("Nominations");
              var nominationsquery = new Parse.Query(Nominations);
              nominationsquery.equalTo("electionID", notification.electionID);
              nominationsquery.limit(1);
              promises.push(nominationsquery.first().then(function(nomination){
                  decisions.push(1);
              }));
          });
          return Parse.Promise.when(promises).then(function(){
              return decisions;
          });
          }).then(function(decisions){
            var numdecisions = decisions.length;
            response.success(numdecisions);
          });
    }, function(error){
          response.error("Adding decision notifications failed. ");
    });
});
Parse.Cloud.beforeSave("Pictures", function(request, response) {
   
  Parse.Cloud.httpRequest({
    url: request.object.get("picture").url()
  }).then(function(response) {
    var image = new Image();
    return image.setData(response.buffer);
  
  }).then(function(image) {
    // Resize the image to 64x64.
    return image.scale({
      width: 256,
      height: 256
    });
  }).then(function(thumbnail){
    var widthDifference = (256 - thumbnail.width);
    var heightDifference = (256 - thumbnail.height);
    if(widthDifference !== 0) {
        var cropLeftRight = (widthDifference / 2);
    } else {
        var cropLeftRight = 0;
    }
    if(heightDifference !== 0){
        var cropTopBottom = (heightDifference / 2);
    } else {
        var cropTopBottom = 0;
    }
    return thumbnail.crop({
      left: cropLeftRight,
      top: cropTopBottom,
      right: cropLeftRight,
      bttom: cropTopBottom,
      success: function(image) {
        return thumbnail;
      },
      error: function(error) {
       console.log("error cropping image");
      }
    });
  }).then(function(image) {
    // Make sure it's a JPEG to save disk space and bandwidth.
    return image.setFormat("JPEG");
  
  }).then(function(image) {
    // Get the image data in a Buffer.
    return image.data();
  
  }).then(function(buffer) {
    // Save the image into a new file.
    var base64 = buffer.toString("base64");
    var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
    return cropped.save();
  
  }).then(function(cropped) {
    // Attach the image file to the original object.
    request.object.set("thumbnail", cropped);
  
  }).then(function(result) {
    response.success();
  }, function(error) {
    response.error(error);
  });
});
Parse.Cloud.beforeSave("ElectionPictures", function(request, response) {

          Parse.Cloud.httpRequest({
            url: request.object.get("picture").url()
          }).then(function(response) {
            var image = new Image();
            return image.setData(response.buffer);
          
          }).then(function(image) {
            // Resize the image to 64x64.
            return image.scale({
              width: 256,
              height: 256
            });
          }).then(function(thumbnail){
            var widthDifference = (256 - thumbnail.width);
            var heightDifference = (256 - thumbnail.height);
            if(widthDifference !== 0) {
                var cropLeftRight = (widthDifference / 2);
            } else {
                var cropLeftRight = 0;
            }
            if(heightDifference !== 0){
                var cropTopBottom = (heightDifference / 2);
            } else {
                var cropTopBottom = 0;
            }
            return thumbnail.crop({
              left: cropLeftRight,
              top: cropTopBottom,
              right: cropLeftRight,
              bttom: cropTopBottom,
              success: function(image) {
                return thumbnail;
              },
              error: function(error) {
               console.log("error cropping image");
              }
            });
          }).then(function(image) {
            // Make sure it's a JPEG to save disk space and bandwidth.
            return image.setFormat("JPEG");
          
          }).then(function(image) {
            // Get the image data in a Buffer.
            return image.data();
          
          }).then(function(buffer) {
            // Save the image into a new file.
            var base64 = buffer.toString("base64");
            var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
            return cropped.save();
          
          }).then(function(cropped) {
            // Attach the image file to the original object.
            request.object.set("thumbnail", cropped);
          
          }).then(function(result) {
            response.success();
          }, function(error) {
            response.error(error);
          });
});
Parse.Cloud.beforeSave("SpherePictures", function(request, response) {

          Parse.Cloud.httpRequest({
            url: request.object.get("picture").url()
          }).then(function(response) {
            var image = new Image();
            return image.setData(response.buffer);
          
          }).then(function(image) {
            // Resize the image to 64x64.
            return image.scale({
              width: 256,
              height: 256
            });
          }).then(function(thumbnail){
            var widthDifference = (256 - thumbnail.width);
            var heightDifference = (256 - thumbnail.height);
            if(widthDifference !== 0) {
                var cropLeftRight = (widthDifference / 2);
            } else {
                var cropLeftRight = 0;
            }
            if(heightDifference !== 0){
                var cropTopBottom = (heightDifference / 2);
            } else {
                var cropTopBottom = 0;
            }
            return thumbnail.crop({
              left: cropLeftRight,
              top: cropTopBottom,
              right: cropLeftRight,
              bttom: cropTopBottom,
              success: function(image) {
                return thumbnail;
              },
              error: function(error) {
               console.log("error cropping image");
              }
            });
          }).then(function(image) {
            // Make sure it's a JPEG to save disk space and bandwidth.
            return image.setFormat("JPEG");
          
          }).then(function(image) {
            // Get the image data in a Buffer.
            return image.data();
          
          }).then(function(buffer) {
            // Save the image into a new file.
            var base64 = buffer.toString("base64");
            var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
            return cropped.save();
          
          }).then(function(cropped) {
            // Attach the image file to the original object.
            request.object.set("thumbnail", cropped);
          
          }).then(function(result) {
            response.success();
          }, function(error) {
            response.error(error);
          });
});
Parse.Cloud.beforeSave("UserPictures", function(request, response) {
          var cropCords = request.object.get("cropCoordinates");
          var cropLeft = cropCords.x || 0.5;
          var cropTop = cropCords.y || 0.5;
          var cropWidth = cropCords.width || 256;
          var cropHeight = cropCords.height || 256;
          Parse.Cloud.httpRequest({
            url: request.object.get("picture").url()
          }).then(function(response) {
            var image = new Image();
            return image.setData(response.buffer);
          
          }).then(function(thumbnail){

            return thumbnail.crop({
              left: cropLeft,
              top: cropTop,
              width: cropWidth,
              height: cropHeight,
              success: function(image) {
                return thumbnail;
              },
              error: function(error) {
               console.log("error cropping image");
              }
            });
          }).then(function(thumbnail) {
            // Resize the image to 256x256.
            return thumbnail.scale({
              width: 256,
              height: 256
            });
          }).then(function(image) {
            // Make sure it's a JPEG to save disk space and bandwidth.
            return image.setFormat("JPEG");
          
          }).then(function(image) {
            // Get the image data in a Buffer.
            return image.data();
          
          }).then(function(buffer) {
            // Save the image into a new file.
            var base64 = buffer.toString("base64");
            var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
            return cropped.save();
          
          }).then(function(cropped) {
            // Attach the image file to the original object.
            request.object.set("thumbnail", cropped);
          
          }).then(function(result) {
            response.success();
          }, function(error) {
            response.error(error);
          });
});
Parse.Cloud.beforeSave("BackgroundPictures", function(request, response) {
          var pageObjectID = request.object.get("pageObjectID");
          var pageType = request.object.get("pageType");
          var BackgroundPictures = Parse.Object.extend("BackgroundPictures");
          var backgroundpicturesquery = new Parse.Query(BackgroundPictures);
          backgroundpicturesquery.equalTo("pageObjectID", pageObjectID);
          backgroundpicturesquery.equalTo("pageType", pageType);
          backgroundpicturesquery.first().then(function(picturealreadythere){
              if((typeof picturealreadythere == "undefined") || (picturealreadythere == "") || (picturealreadythere == null)){
                  return true;
              } else {
                  return picturealreadythere.destroy();
              }
          }).then(function(){
              Parse.Cloud.httpRequest({
                url: request.object.get("picture").url()
              }).then(function(response) {
                var image = new Image();
                return image.setData(response.buffer);
              
              }).then(function(thumbnail){
                var cropCords = request.object.get("cropCoordinates");
                var cropLeft = cropCords.x || 0.5;
                var cropTop = cropCords.y || 0.5;
                var cropWidth = cropCords.width || 972;
                var cropHeight = cropCords.height || 261;
                return thumbnail.crop({
                  left: cropLeft,
                  top: cropTop,
                  width: cropWidth,
                  height: cropHeight,
                  success: function(image) {
                    return thumbnail;
                  },
                  error: function(error) {
                   console.log("error cropping image");
                  }
                });
              }).then(function(image) {
                // Resize the image to 64x64.
                return image.scale({
                  width: 972,
                  height: 261
                });
              }).then(function(image) {
                // Make sure it's a JPEG to save disk space and bandwidth.
                return image.setFormat("JPEG");
              
              }).then(function(image) {
                // Get the image data in a Buffer.
                return image.data();
              
              }).then(function(buffer) {
                // Save the image into a new file.
                var base64 = buffer.toString("base64");
                var cropped = new Parse.File("backgroundImage.jpg", { base64: base64 });
                return cropped.save();
              
              }).then(function(cropped) {
                // Attach the image file to the original object.
                request.object.set("backgroundimage", cropped);
              
              }).then(function(result) {
                response.success();
              }, function(error) {
                response.error(error);
              });
          });
});
Parse.Cloud.beforeSave("Spheres", function(request, response) {
    var sphere = request.object;

    var toLowerCase = function(w) { return w.toLowerCase(); };

    var namewords = sphere.get("sphereName").match(/\S+/g);
    namewords = _.map(namewords, toLowerCase);
    var stopWords = ["the", "in", "and"];
    namewords = _.filter(namewords, function(w) { return ! _.contains(stopWords, w); });
    
    var descriptionwords = sphere.get("sphereDescription").match(/\S+/g);
    descriptionwords = _.map(descriptionwords, toLowerCase);
    var stopDescriptionWords = ["the", "in", "and"];
    descriptionwords = _.filter(descriptionwords, function(w) { return ! _.contains(stopDescriptionWords, w); });
    
    sphere.set("searchNameWords", namewords);
    sphere.set("searchDescriptionWords", descriptionwords);
    response.success();
});