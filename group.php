<?php
require_once 'vendor/autoload.php';

use Facebook\HttpClients\FacebookHttpable;
use Facebook\HttpClients\FacebookCurl;
use Facebook\HttpClients\FacebookCurlHttpClient;
use Facebook\HttpClients\FacebookStream;
use Facebook\HttpClients\FacebookStreamHttpClient;
use Facebook\HttpClients\FacebookGuzzleHttpClient;

use Facebook\Entities\AccessToken;
use Facebook\Entities\SignedRequest;
 
use Facebook\FacebookSession;
use Facebook\FacebookRedirectLoginHelper;
use Facebook\FacebookRequest;
use Facebook\FacebookResponse;
use Facebook\FacebookSDKException;
use Facebook\FacebookRequestException;
use Facebook\FacebookOtherException;
use Facebook\FacebookAuthorizationException;
use Facebook\GraphObject;
use Facebook\GraphSessionInfo;

use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseQuery;
use Parse\ParseACL;
use Parse\ParsePush;
use Parse\ParseUser;
use Parse\ParseInstallation;
use Parse\ParseException;
use Parse\ParseAnalytics;
use Parse\ParseFile;
use Parse\ParseCloud;


session_start();
require_once 'configuration/facebookInit.php';
ParseClient::initialize($parseAppID, $parseRestAPIKey, $parseMasterKey);
FacebookSession::setDefaultApplication($appID, $appSecret);
$session = $_SESSION['POPRULER'];
if (empty($session) || $session == null) {
      header("Location: https://".$_SERVER['HTTP_HOST']."/index.php");
}
elseif(isset($session) && $session !== null) {
   if(empty($_GET['groupID'])) { 
      header("Location: https://".$_SERVER['HTTP_HOST']."/profile.php");
   }
   else {
        /* helper functions */
      function roundUpToAny($n,$x=5) {
         return (round($n)%$x === 0) ? round($n) : round(($n+$x/2)/$x)*$x;
      }
      function objectsToArrays($array) {
       while(list($key, $value) = each($array)) {
        $result = $array[$key];
       }
         return $result;
      }
      function totalFriends($fsession, $friendID) {
           $user_friends = new FacebookRequest($fsession, 'GET', '/'.$friendID.'/friends');
           $user_friends_response = $user_friends->execute();
           $user_friends_object = $user_friends_response->getGraphObject();
           $array1 = (array) $user_friends_object;
           $friendsArrayData = objectsToArrays($array1);
           $userFriendsCountArray = $friendsArrayData['summary'];
           $userFriendsCount = (array) $userFriendsCountArray;
           $userFacebookFriendsCount = $userFriendsCount['total_count'];
           return $userFacebookFriendsCount;
          
      }
      function parseFriends($fsession, $friendsArrayData, $friendID, $friends, $recursive) {
          if($recursive === false) {
              $user_friends = new FacebookRequest($fsession, 'GET', '/'.$friendID.'/friends');
              $user_friends_response = $user_friends->execute();
              $user_friends_object = $user_friends_response->getGraphObject();
              $array1 = (array) $user_friends_object;
              $friendsArrayData = objectsToArrays($array1);
              $friendsArray = $friendsArrayData['data'];
              $friends = array();
               for($i=0; $i < count($friendsArray); $i++) {
                   $friendsArrayFriendObject = $friendsArray[$i];
                   $friendArrayData = (array) $friendsArrayFriendObject;
                   array_push($friends, array("id" => $friendArrayData['id'], "name" => $friendArrayData['name']));
               }
          }
          $moreFriends = $friends ?: array();
          $nextList = $friendsArrayData['paging'];
          $nextListArray = (array) $nextList;
          $next = $nextListArray['next'];
          if(!empty($next) && (strlen($next) > 5)) {
              $user_friends_object = file_get_contents($next);
      
              $array2 = (array) $user_friends_object;
              $moreFriendsArrayData = objectsToArrays($array2);
              $moreFriendsData = $moreFriendsArrayData['data'];
              for($i=0; $i < count($moreFriendsData); $i++) {
                  $friendsArrayFriendObject = $moreFriendsData[$i];
                  $friendArrayData = (array) $friendsArrayFriendObject;
                  array_push($moreFriends, array("id" => $friendArrayData['id'], "name" => $friendArrayData['name']));
              }
              return parseFriends($fsession, $moreFriendsArrayData, $friendID, $moreFriends, true);
          }
          return $moreFriends;
      }
      function parseLikes($fsession, $friendID, $pageIDs, $after, $more) {
          if($more === true) {
              $user_likes = new FacebookRequest($fsession, 'GET', '/'.$friendID.'/likes?fields=id&limit=100&after='.$after);
              $user_likes_response = $user_likes->execute();
              $user_likes_object = $user_likes_response->getGraphObject();
              $array2 = (array) $user_likes_object;
              while(list($key, $value) = each($array2)) {
                     $likesArrayData = $array2[$key];
                }
              $likesData = $likesArrayData['data'];
              $nextObject = $likesArrayData['paging'];
              $nextObjectToArray = (array) $nextObject;
              $next = $nextObjectToArray['next'] ?: 0;
              $afterObject = $nextObjectToArray['cursors'];
              $afterObjectToArray = (array) $afterObject;
              $after = $afterObjectToArray['after'];
              if(count($pageIDs) > 0) { $likes = $pageIDs; } else { $likes = array(); }
              for($i=0; $i < count($likesData); $i++) {
                 $likeObject = $likesData[$i];
                 $likeObjectToArray = (array) $likeObject;
                 $likeID = $likeObjectToArray['id'];
                 array_push($likes, $likeID);
              }
          }
          if(!empty($next)) {
             return parseLikes($fsession, $friendID, $likes, $after, true);
          } 
          elseif(empty($next)) {
             return $likes;
          } else {
             return $likes;
          }
                  
      }
      function groupNominations($groupID) {
            $nominationIsSetObject = new ParseQuery("Nominations");
            $nominationExists = $nominationIsSetObject->equalTo("groupID", $groupID);
            $results = $nominationIsSetObject->find();
            if(!empty($results)) {
                $pageIDs = array();
                for($i=0; $i < count($results); $i++) {
                    $object = $results[$i];
                    $pageID = $object->get("pageID");
                    array_push($pageIDs, $pageID);
                }
            } else {
               $pageIDs = false;
             }
            return $pageIDs;
      }
     function votesSpent($friendID) {
        $memberIsSetObject = new ParseQuery("Votes");
        $memberExists = $memberIsSetObject->equalTo("onBehalfOf", $friendID);
        $memberIsSetObject->select("votes");
        $result = $memberIsSetObject->find();
        if(!empty($result)) {
            if($result !== false) {
                $numberOfPointsSpent = 0;
                for($i=0; $i < count($result); $i++) {
                    $votesObject = $result[$i];
                    $numberOfVotesPerObject = $votesObject->get("votes");
                    $numberOfPointsSpent = $numberOfPointsSpent + $numberOfVotesPerObject;
                } 
           }
        } else {
           $numberOfPointsSpent = false;
         }
        return $numberOfPointsSpent;
      }
      function countVotesForPageWithinGroup($groupID, $pageID) {
              $numberOfVotes = 0;
              $votesQuery = new ParseQuery("Votes");
              $votesQuery->equalTo("pageID", $pageID);
              $votesQuery->equalTo("groupID", $groupID);
              $votesInGroups = $votesQuery->find();
              if(!empty($votesInGroups)) {
                  for($i=0; $i < count($votesInGroups); $i++) {
                    $votesObject = $votesInGroups[$i];
                    $votesForPageInGroup = $votesObject->get("votes");
                    $numberOfVotes += $votesForPageInGroup;
                    }
              } else {
                  $numberOfVotes = null;
              }
              return $numberOfVotes;
      }
      function userRepsWho($fUserID) {
              $representatives = new ParseQuery("Representatives");
              $representatives->equalTo("repID", $fUserID);
              $represents = $representatives->find();
              if(!empty($represents)) {
                  $repsWho = array();
                  for($i=0; $i < count($represents); $i++) {
                    $representsMember = $represents[$i];
                    $reps = $representsMember->get("fMemberID");
                    array_push($repsWho, $reps);
                  }
              } else {
                  $repsWho = false;
              }
              return $repsWho;
          }
          function MyRepIs($fUserID) {
              $representatives = new ParseQuery("Representatives");
              $representatives->equalTo("fMemberID", $fUserID);
              $representative = $representatives->first();
              if(!empty($representative)) {
                  $representedBy = $representative->get("repID");
              } else {
                  $representedBy = false;
              }
              return $representedBy;
          }
          function membersInGroup($groupID) {
            $groupMembersQuery = new ParseQuery("GroupMembers");
            $groupMembersQuery->equalTo("groupID", $groupID);
            $results = $groupMembersQuery->find();
            if(!empty($results)) {
                if($results !== false) {
                    $groupMembers = array();
                    for($i=0; $i < count($results); $i++) {
                        $groupMember = $results[$i];
                        $memberOfGroup = $groupMember->get("fMemberID");
                        array_push($groupMembers, $memberOfGroup);
                    } 
               }
            } else {
               $groupMembers = false;
             }
            return $groupMembers;
         }
      function nominationMade($friendID, $groupID) {
           $nominatingMemberQuery = new ParseQuery("Nominations");
           $nominatingMemberQuery->equalTo("fMemberID", $friendID);
           $nominatingMemberQuery->equalTo("groupID", $groupID);
           $result = $nominatingMemberQuery->first();
           if(!empty($result)) {
               $nominationMade = $result->get("pageName");
           } else {
               $nominationMade = false;
           }
           return $nominationMade;
      }
      function memberGroups($fUserID) { 
                $memberGroupQuery = new ParseQuery("GroupMembers");
                $memberGroupQuery->equalTo("fMemberID", $fUserID);
                $results = $memberGroupQuery->find();
                if(!empty($results)) {
                    $memberGroups = array();
                    for($i=0; $i < count($results); $i++) {
                        $result = $results[$i];
                        $memberGroupID = $result->get("groupID");
                        array_push($memberGroups, $memberGroupID);
                    } 
                } else {
                        $memberGroups = false;
                    }
                return $memberGroups;
            }
         function amIAdmin($groupID, $fUserID) {
             $adminQuery = new ParseQuery("GroupMembers");
             $adminQuery->equalTo("groupID", $groupID);
             $adminQuery->equalTo("fMemberID", $fUserID);
             $result = $adminQuery->first();
             if(!empty($result)) {
                 $isAdmin = $result->get("administrator");
             } else {
                 $isAdmin = false;
             }
             return $isAdmin;
         }  
         function electionsCreatedByMember($fUserID) {
             $adminQuery = new ParseQuery("Elections");
             $adminQuery->equalTo("fMemberID", $fUserID);
             $results = $adminQuery->find();
             if(!empty($results)) {
                 $electionsCreated = array();
                 for($i=0; $i < count($results); $i++) {
                    $result = $results[$i];
                    $electionID = $result->get("objectId");
                    array_push($electionsCreated, $electionID);
                 }
             } else {
                 $electionsCreated = false;
             }
             return $electionsCreated;
         }
         function electionsInGroup($groupID) {
             $adminQuery = new ParseQuery("Elections");
             $adminQuery->equalTo("groupID", $groupID);
             $results = $adminQuery->find();
             if(!empty($results)) {
                 $electionsCreated = array();
                 for($i=0; $i < count($results); $i++) {
                    $result = $results[$i];
                    $electionID = $result->getObjectId();
                    array_push($electionsCreated, $electionID);
                 }
             } else {
                 $electionsCreated = false;
             }
             return $electionsCreated;
         }
     $groupID = $_GET['groupID'];   
     $fsession = new FacebookSession($session);
     $loginClass = new FacebookRedirectLoginHelper("https://".$host."/index.php", $appID, $appSecret);
     $logoutURL = $loginClass->getLogoutUrl($fsession, "https://".$host."/logout.php");
     $appsecret_proof = hash_hmac('sha256', $fAppToken, $appSecret);
     
     /* User Data */
   
     //About
     $user_profile = new FacebookRequest($fsession, 'GET', '/me');
     $user_profile_response = $user_profile->execute();
     $user_profile_object = $user_profile_response->getGraphObject();
     $fUserID = $user_profile_object->getProperty('id');
     $userFirstName = $user_profile_object->getProperty("first_name");
     $userName = $user_profile_object->getProperty("name");
     
     //Picture
     $user_picture = new FacebookRequest($fsession, 'GET', '/me/picture?redirect=false');
     $user_picture_response = $user_picture->execute();
     $user_picture_object = $user_picture_response->getGraphObject();
     $fUserPictureObject = (array) $user_picture_object;
     $fUserPictureArray = objectsToArrays($fUserPictureObject);
     $fUserPicture = $fUserPictureArray['url'];
     
     //Friends
     $userFacebookFriendsCount = totalFriends($fsession, $fUserID);
     $userFriendsArray = parseFriends($fsession, $friendsArrayData, $fUserID, $friends, false);
     $userFriendsIDsArray = array();
     for($i=0; $i < count($userFriendsArray); $i++) {
         array_push($userFriendsIDsArray, $userFriendsArray[$i]['id']);
     }
     $userFriendsOnPoprulerCount = count($userFriendsArray);
     $userFriendsCountProgressUnrounded = ($userFriendsOnPoprulerCount / $userFacebookFriendsCount);
     $userFriendsCountProgress = round(($userFriendsCountProgressUnrounded * 100), 2);
     
     //Likes
     $userLikes = parseLikes($fsession, $fUserID, $likes, $after, true);
     $numberOfTotalUserLikes = count($userLikes);
     
     //Votes
     //$userVotesAllowed = ($userFacebookFriendsCount + $userPopRulerPointsEarned);
     $userVotesSpent = votesSpent($fUserID) ?: 0;
     //$userVotesBalance = (intval($userFacebookFriendsCount) - intval($userVotesSpent));
     
     //Representation
     $userHasARep = MyRepIs($fUserID) ?: false;
     $userRepresentsWho = userRepsWho($fUserID) ?: false;
     if(($userHasARep !== false) && ($userRepresentsWho !== false)) {
         $representedUsers = $userRepresentsWho; //User Reps People and Doesn't Rep Himself
      } elseif($userHasARep === false) {
         $userReps = array($fUserID);
         if($userRepresentsWho !== false) {
         array_push($userReps, $userRepresentsWho); //User Himself and possibly Represents Others
         }
         $representedUsers = $userReps; 
     } elseif(($userHasARep !== false) && ($userRepresentsWho === false)) {
         $representedUsers = array($userHasARep);  //User Doesn't Rep himself or other people
     }

     $numberOfRepresentedUsers = count($representedUsers);
     
     //Nomination Made
     $userNominated = nominationMade($fUserID, $groupID) ?: false;
     
     //Groups
     $groupsOfUser = memberGroups($fUserID) ?: false;
     $numberOfUserGroups = count($groupsOfUser);

     /* Group Data */

     //Picture
     $group_picture = new FacebookRequest($fsession, 'GET', '/'.$groupID.'?fields=picture&redirect=false');
     $group_picture_response = $group_picture->execute();
     $grouppicture_object = $group_picture_response->getGraphObject();
     $fGroupPictureObject = (array) $group_picture_object;
     $fGroupPictureArray = objectsToArrays($fGroupPictureObject);
     $fGroupPicture = $fGroupPictureArray['url'];
     //name
     $groupIsSetObject = new FacebookRequest($fsession, 'GET', '/'.$groupID.'?fields=name');
     $groupObjectExists = $groupIsSetObject->execute();
     $groupResult = $groupObjectExists->getGraphObject();
     $groupName = $groupResult->getProperty('name');
     //parent
     $groupIsSetObject = new FacebookRequest($fsession, 'GET', '/'.$groupID.'?fields=parent');
     $groupObjectExists = $groupIsSetObject->execute();
     $groupResult = $groupObjectExists->getGraphObject();
     $groupParentName = $groupResult->getProperty('name');
     $groupParentID = $groupResult->getProperty('id');
     //group members
     $groupMembers = membersInGroup($groupID) ?: array();
     
     $numberOfPopRulerMembersInGroup = count($groupMembers);
     $friendsInGroupArray = array_intersect($userFriendsIDsArray, $groupMembers);
     $numberOfUsersFriendsInGroup = count($friendsInGroupArray);
     
     
     if(!in_array($groupID, $groupsOfUser)) {
         header("Location: https://".$host."/joinGroup.php?groupID=".$groupID);
     }
     $isAdmin = amIAdmin($groupID, $fUserID) ?: 0;
     $electionsInGroup = electionsInGroup($groupID);
     
   ?>
   
   <!DOCTYPE html>
   <!--[if lt IE 7]> <html class="ie ie6 lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
   <!--[if IE 7]>    <html class="ie ie7 lt-ie9 lt-ie8"        lang="en"> <![endif]-->
   <!--[if IE 8]>    <html class="ie ie8 lt-ie9"               lang="en"> <![endif]-->
   <!--[if IE 9]>    <html class="ie ie9"                      lang="en"> <![endif]-->
   <!--[if !IE]><!-->
   <html lang="en" class="no-ie">
   <!--<![endif]-->
   
   <head>
      <!-- Meta-->
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
      <meta name="description" content="Find out What's Popular on Facebook Amongst Your Friend Group">
      <meta name="keywords" content="popular, popularity of things amongst friends">
      <meta name="author" content="Buck Mower">
      <title>PopRuler | <?php echo $groupName; ?></title>
      <link rel="icon" type="img/png" href="assets/poprulerIcon.png">
      <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
      <!--[if lt IE 9]><script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script><script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script><![endif]-->
      <!-- Bootstrap CSS-->
      <link rel="stylesheet" href="admin/app/css/bootstrap.css">
      <!-- Vendor CSS-->
      <link rel="stylesheet" href="admin/vendor/fontawesome/css/font-awesome.min.css">
      <link rel="stylesheet" href="admin/vendor/animo/animate+animo.css">
      <link rel="stylesheet" href="admin/vendor/csspinner/csspinner.min.css">
      <!-- START Page Custom CSS-->
      <!-- END Page Custom CSS-->
      <!-- App CSS-->
      <link rel="stylesheet" href="admin/app/css/app.css">
      <!-- Modernizr JS Script-->
      <script src="admin/vendor/modernizr/modernizr.js" type="application/javascript"></script>
      <!-- FastClick for mobiles-->
      <script src="admin/vendor/fastclick/fastclick.js" type="application/javascript"></script>
      <script src="admin/vendor/jquery/jquery.min.js"></script>
      <script src="searchPagesToNominate.js"></script>
      <script>
      $(document).ready(function() {
         $("#inviteFriends").click(function() {
            window.top.location.href = 'https://www.facebook.com/dialog/apprequests?app_id=487409348027542&message=Have%20You%20Checked%20Your%20Stats%20Recently%3F&redirect_uri=https://www.popruler.com/profile.php';
         });
         $("#userProfile").click(function() {
            window.location.href = '/profile.php';
         });
         $("#dismissSuggestionsButton").click(function() {
            $("#suggestionsFrame").addClass("hidden");
         });
      });
      </script>
   </head>
<body class="">
<div id="fb-root"></div>
    <?php 
    require_once 'settings.php';
    require_once 'createElectionModal.php';
    require_once 'electionSettingsModal.php';
    ?>
      <!-- START Main wrapper-->
      <section class="wrapper">
         <!-- START Top Navbar-->
         <nav role="navigation" class="navbar navbar-default navbar-top navbar-fixed-top">
            <!-- START navbar header-->
            <div class="navbar-header">
               <a href="https://<?php echo $host.'/profile.php'; ?>" class="navbar-brand">
                  <div class="brand-logo">popruler</div>
                  <div class="brand-logo-collapsed">pop<br>ruler</div>
               </a>
            </div>
            <!-- END navbar header-->
            <!-- START Nav wrapper-->
            <div class="nav-wrapper">
               <!-- START Left navbar-->
               <ul class="nav navbar-nav">
                  <li>
                     <a href="#" data-toggle="aside">
                        <em class="fa fa-align-left"></em>
                     </a>
                  </li>
               <!--   <li>
                     <a href="#" data-toggle="navbar-search">
                        <em class="fa fa-search"></em>
                     </a>
                  </li> -->
               </ul>
               <!-- END Left navbar-->
               <!-- START Right Navbar-->
               <ul class="nav navbar-nav navbar-right">
                  <!-- START Alert menu-->
                  <li class="dropdown dropdown-list">
                   <!--  <a href="#" data-toggle="dropdown" data-play="bounceIn" class="dropdown-toggle">
                        <em class="fa fa-bell"></em>
                        <div class="label label-info">120</div>
                     </a> -->
                     <!-- START Dropdown menu-->
                     <ul class="dropdown-menu">
                        <li>
                           <div class="scroll-viewport">
                              <!-- START list group-->
                              <!-- <div class="list-group">
                                 <!-- list item-->
                                <!-- <a href="#" class="list-group-item">
                                    <div class="media">
                                       <div class="pull-left">
                                          <em class="fa fa-envelope-o fa-2x text-success"></em>
                                       </div>
                                       <div class="media-body clearfix">
                                          <div class="media-heading">Unread messages</div>
                                          <p class="m0">
                                             <small>You have 10 unread messages</small>
                                          </p>
                                       </div>
                                    </div>
                                 </a>
                              </div> -->
                              <!-- END list group-->
                           </div>
                        </li>
                     </ul>
                     <!-- END Dropdown menu-->
                  </li>
                  <!-- END Alert menu-->
                  <!-- END User menu-->
                  <!-- START Contacts button-->
                  <!-- <li>
                     <a href="#" data-toggle="offsidebar">
                        <em class="fa fa-align-right"></em>
                     </a>
                  </li> -->
                  <!-- END Contacts menu-->
               </ul>
               <!-- END Right Navbar-->
            </div>
            <!-- END Nav wrapper-->
            <!-- START Search form-->
          <!--  <form role="search" class="navbar-form">
               <div class="form-group has-feedback">
                  <input type="text" placeholder="Type and hit Enter.." class="form-control">
                  <div data-toggle="navbar-search-dismiss" class="fa fa-times form-control-feedback"></div>
               </div>
               <button type="submit" class="hidden btn btn-default">Submit</button>
            </form> -->
            <!-- END Search form-->
         </nav>
         <!-- END Top Navbar-->
         <!-- START aside-->
         <aside class="aside">
            <!-- START Sidebar (left)-->
            <nav class="sidebar" style="overflow: auto;">
               <ul class="nav">
               <!-- START user info-->
               <li>
                  <div class="item user-block" id="userProfile">
                     <!-- User picture-->
                     <div class="user-block-picture">
                        <img src="<?php echo $fUserPicture; ?>" alt="<?php echo $userName; ?>" width="60" height="60" class="img-thumbnail img-circle">
                     </div>
                     <!-- Name and Role-->
                     <div class="user-block-info">
                        <span class="user-block-name"><?php echo $userFirstName; ?></span>
                     </div>
                  </di>
               </li>
               <!-- END user info-->
               <!-- START Menu-->
               <li class="">
                  <a href="/votes.php" title="votes">
                     <em class="fa fa-star"></em>
                     <div class="label label-primary pull-right"><?php echo $userVotesSpent; ?></div>
                     <span class="item-text" style="padding-right: 15px;">Votes</span>
                  </a>
               </li>
               <li class="">
                  <a href="/representation.php" title="representation">
                     <em class="fa fa-group"></em>
                     <div class="label label-primary pull-right"><?php echo $numberOfRepresentedUsers; ?></div>
                     <span class="item-text" style="padding-right: 15px;">Representation</span>
                  </a>
               </li>
               <li class="">
                  <a href="/poprulerGroups.php" title="groups">
                     <em class="fa fa-flag"></em>
                     <div class="label label-primary pull-right"><?php echo $numberOfUserGroups; ?></div>
                     <span class="item-text" style="padding-right: 15px;">Groups</span>
                  </a>
               </li>
               <li class="">
                  <a href="/likes.php" title="likes">
                     <em class="fa fa-thumbs-up"></em>
                     <div class="label label-primary pull-right"><?php echo $numberOfTotalUserLikes; ?></div>
                     <span class="item-text" style="padding-right: 15px;">Likes</span>
                  </a>
               </li>
               <!-- END Menu-->
               <!-- Sidebar footer -->
                  <li class="nav-footer">
                     <div class="nav-footer-divider"></div>
                     <!-- START button group-->
                     <div class="btn-group text-center">
                        <!-- <button type="button" data-toggle="tooltip" data-title="Add Contact" class="btn btn-link">
                           <em class="fa fa-user text-muted"><sup class="fa fa-plus"></sup>
                           </em>
                        </button> -->
                        <button data-toggle="modal" data-target="#settingsModal" type="button" data-toggle="tooltip" data-title="Settings" class="btn btn-link">
                           <em class="fa fa-cog text-muted"></em>
                        </button>
                        <a href="<?php echo $logoutURL; ?>" type="button" data-toggle="tooltip" data-title="Logout" class="btn btn-link">
                           <em class="fa fa-sign-out text-muted"></em>
                        </a>
                     </div>
                     <!-- END button group-->
                  </li>
               </ul>
            </nav>
            <!-- END Sidebar (left)-->
         </aside>
         <!-- End aside-->
         <!-- START Main section-->
         <section>
            <!-- START Page content-->
            <section class="main-content">
               <h3><?php echo $groupName; ?></h3>
               <!-- START summary widgets-->
               <div class="row">
                  <div class="col-lg-6 col-sm-12">
                     <!-- START widget-->
                     <div data-toggle="play-animation" data-play="fadeInDown" data-offset="0" data-delay="100" class="panel widget">
                        <div class="panel-body bg-primary">
                           <div class="row row-table row-flush">
                              <div class="col-xs-8">
                                 <p class="mb0">PopRuler Members In Group</p>
                              </div>
                              <div class="col-xs-4 text-center">
                                 <h3 class="m0"><?php echo $numberOfPopRulerMembersInGroup; ?></h3>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="col-lg-6 col-sm-12">
                     <!-- START widget-->
                     <div data-toggle="play-animation" data-play="fadeInDown" data-offset="0" data-delay="500" class="panel widget">
                        <div class="panel-body bg-success">
                           <div class="row row-table row-flush">
                              <div class="col-xs-8">
                                 <p class="mb0">Friends Of Yours</p>
                              </div>
                              <div class="col-xs-4 text-center">
                                 <h3 class="m0"><?php echo $numberOfUsersFriendsInGroup; ?></h3>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <?php
               $likesChunks = array_chunk($electionsInGroup, 6);
               $pagesOfLikes = count($likesChunks);
               $getpage = $_GET['pg'];
               $page = $getpage - 1;
               if(empty($page) || ($page <= 0) || ($page > $pagesOfLikes)) {
               $currentPageOfLikes = 0;
               } else {
               $currentPageOfLikes = intval($page);
               }
               $chunkOfUserLikes = $likesChunks[$currentPageOfLikes];
    
               if(count($chunkOfUserLikes) > 0) {
                   if(count($chunkOfUserLikes) < 2) {
                       ?>
                   <div class="row">
                   <?php
                   }
        
                 for($i=0; $i < count($chunkOfUserLikes); $i++) {
                   $electionID = $chunkOfUserLikes[$i];
                   $electionsQuery = new ParseQuery("Elections");
                   $electionsQuery->equalTo("objectId", $electionID);
                   $electionsQuery->equalTo("groupID", $groupID);
                   $election = $electionsQuery->first();
                   $eName = $election->get("electionName");
                   $eDescription = $election->get("electionDescription");
                   $electionEndDate = $election->get("endDate");
                   $eEndDate = $electionEndDate->format('Y-m-d H:i:s');
                 if((($i+1)/2) == 0) {
                  ?>
                   <div class="row">
                   <?php
                  }
                  ?>
                   <div class="col-md-6">
                      <!-- START panel-->
                      <div class="panel panel-default">
                         <div class="panel-heading"><?php echo $eName; ?></div>
                         <div class="panel-body">
                           <p><?php echo $eDescription; ?></p>
                         </div>
                         <div class="panel-footer">
                            <a href="https://<?php echo $host; ?>/election.php?groupID=<?php echo $groupID; ?>&electionID=<?php echo $electionID; ?>" class="btn btn-default">Go to Election</a>
                            <?php
                            if($isAdmin == 1) {
                                ?>
                            <button  data-toggle="modal" data-target="#electionSettingsModal" data-groupid="<?php echo $groupID; ?>" data-electionid="<?php echo $electionID; ?>" data-electionenddate="<?php echo $eEndDate; ?>" data-electionname="<?php echo $eName; ?>" data-electiondescription="<?php echo $eDescription; ?>" class="btn btn-warning pull-right">Election Settings</button>
                            <?php
                            }
                            ?>
                         </div>
                      </div>
                      <!-- END panel-->
                   </div>
                 <?php
                   if($i > 0 && $i/2 == 0) {
                      echo "</div>";
                   } else {
                      if((count($chunkOfUserLikes) < 6) && (($i + 1) == count($chunkOfUserLikes)))  {
                         echo "</div>";
                      }
                   }
                }
                ?>
               <div class="row">
                   <div class="col-xs-12">
                      <div class="dataTables_info" id="datatable1_info" role="status" aria-live="polite">Showing
                      <?php if($currentPageOfLikes == 0) { echo "1"; } 
                      else { echo ((6 * $currentPageOfLikes) + 1); 
                      } 
                      ?> to 
                      <?php if($currentPageOfLikes == 0) { echo count($chunkOfUserLikes); }
                      else { 
                         if(($currentPageOfLikes + 1) < $pagesOfLikes) {
                            echo (($currentPageOfLikes * 6) + 6);
                         }
                         elseif(($currentPageOfLikes + 1) == $pagesOfLikes) { 
                         echo ((($currentPageOfLikes * 6) + 6) - (6 - count($chunkOfUserLikes))); 
                         } 
                      } ?> of 
                      <?php echo count($electionsInGroup); 
                      ?> elections in <?php echo $groupName; ?></div>
                   </div>
               </div>
               <div class="row">
                  <div class="col-xs-12">
                     <div class="dataTables_paginate paging_simple_numbers" id="datatable1_paginate">
                        <ul class="pagination">
                           <li class="paginate_button previous <?php if($currentPageOfLikes <= 0) { echo 'disabled'; } ?>" tabindex="0" id="datatable1_previous">
                              <a href="https://<?php echo $host; ?>/group.php?pg=<?php if($currentPageOfLikes > 0) { echo $currentPageOfLikes; } else { echo "0"; }?>">Previous</a>
                           </li>
                           <?php
                            for($i=0; $i < $pagesOfLikes; $i++) {
                           ?>
                           <li class="paginate_button <?php if($i == $currentPageOfLikes) { echo "active"; } ?>" tabindex="0">
                              <a href="https://<?php echo $host; ?>/group.php?pg=<?php echo ($i + 1); ?>"><?php echo ($i + 1); ?></a>
                           </li>
                           <?php
                            }
                            ?>
                            <li class="paginate_button next <?php if((($currentPageOfLikes + 1) >= $pagesOfLikes) || ($pagesOfLikes == 1)) { echo 'disabled'; } ?>" tabindex="0" id="datatable1_next">
                                <a href="https://<?php echo $host; ?>/group.php?pg=<?php if($currentPageOfLikes < $pagesOfLikes) { echo $currentPageOfLikes + 2; }?>">Next</a>
                            </li>
                         </ul>
                      </div>
                   </div>
                </div>
                <?php
                   }
                   ?>
               <div class="row">
                   <div class="col-md-4">
                     <div class="panel panel-default">
                       <div class="panel-heading">Create An Election?</div>
                       <div class="panel-body">
                         <?php
                         if($isAdmin == 1) {
                             $electionsCreatedQuery = new ParseQuery("Elections");
                             $electionsCreatedQuery->equalTo("groupID", $groupID);
                             $result = $electionsCreatedQuery->find();
                             if(!empty($result)) {
                                 $electionsCreatedQuery->count();
                                 $electionsCreated = $electionsCreatedQuery;
                             }
                             
                         ?>
                         <p><?php if(count($electionsCreated) > 0) { echo "Create Another Election Within ".$groupName."?"; } else { echo "You Haven't Created Any Elections Within ".$groupName; } ?></p>
                        <?php
                         } else {
                             ?>
                             <p>Only Administrators of the group can create elections within the group. It doesn't look like you are an administrator in this group.</p>
                             <?php
                         }
                         ?>
                       </div>
                       <?php
                       if($isAdmin == 1) {
                       ?>
                       <div class="panel-footer">
                         <button class="btn btn-default" data-toggle="modal" data-target="#createElectionModal">Create Election</button>
                       </div>
                       <?php
                       } else {
                           ?>
                           <div class="panel-footer">
                           </div>
                           <?php
                       }
                       ?>
                     </div>
                   </div>
                   <div class="col-md-4" style="visibility: hidden;"></div>
                   <div class="col-md-4" style="visibility: hidden;"></div>
                 </div>
               <!-- END summary widgets-->
            </section>
            <!-- END Page content-->
         </section>
         <!-- END Main section-->
      </section>
      <!-- END Main wrapper-->
      <!-- START Scripts-->
      <!-- MomentJs and Datepicker-->
      <script src="admin/vendor/moment/min/moment-with-langs.min.js"></script>
      <script src="admin/vendor/datetimepicker/js/bootstrap-datetimepicker.min.js"></script>
      <script>
          $(document).ready(function() {
          $('#electionSettingsModal').on('show.bs.modal', function (event) {
              var button = $(event.relatedTarget); // Button that triggered the modal
              var ElectionID = button.data('electionid'); // Extract info from data-* attributes
              var ElectionName = button.data('electionname'); // Extract info from data-* attributes
              var ElectionDescription = button.data('electiondescription'); // Extract info from data-* attributes
              var ElectionEndDate = button.data('electionenddate'); // Extract info from data-* attributes
              //var GroupID = button.data('groupid'); // Extract info from data-* attributes
              var modal = $(this);
              
              var electionNameInput = $('input[name="electionName"]');
              var electionIDInput = $('input[name="updateElection"]');
              var electionDescriptionInput = $('textarea[name="electionDescription"]');
              var electionEndDateInput = $('input[name="electionEndDateTime"]');
              
              var dateTime = moment.utc(ElectionEndDate, "YYYY-MM-DD HH:mm").local();
              var dateTimeFormatted = dateTime.format("dddd, MMMM Do YYYY, h:mm:ss a");
              modal.find(electionNameInput).val(ElectionName);
              modal.find(electionIDInput).val(ElectionID);
              modal.find(electionDescriptionInput).text(ElectionDescription);
              modal.find(electionEndDateInput).val(dateTimeFormatted);
            });
      });
      </script>
      <script>
          $(document).ready(function() {
              var submitButton = $('input[name="submitNewElection"]');
              $(submitButton).click(function() {
                  var endDateInput = $('input[name="electionEndDateTime"]');
                  var dateSet = $("#createElectionModal").find(endDateInput).val();
                  var dateTime = moment(dateSet, "MM-DD-YYYY HH:mm A").utc();
                  //var dateTimeUTC = moment.utc(dateTime);
                  var dateTimeFormatted = dateTime.toISOString();
                  $("#createElectionModal").find(endDateInput).val(dateTimeFormatted);
              });
              var updateButton = $('input[name="submitNewElection"]');
              var electionEndDateInput = $('input[name="electionEndDateTime"]');
              $(updateButton).click(function() {
                 var dateSet = $('#electionSettingsModal').find(electionEndDateInput).val();
                 var dateTime = moment(dateSet, "MM-DD-YYYY HH:mm A").utc();
                 //var dateTimeUTC = moment.utc(dateTime);
                 var dateTimeFormatted = dateTime.toISOString();
                 $('#electionSettingsModal').find(electionEndDateInput).val(dateTimeFormatted);
             });
          });
      </script>
      <!-- Main vendor Scripts-->
      <script src="admin/vendor/bootstrap/js/bootstrap.min.js"></script>
      <!-- Plugins-->
      <script src="admin/vendor/chosen/chosen.jquery.min.js"></script>
      <script src="admin/vendor/slider/js/bootstrap-slider.js"></script>
      <script src="admin/vendor/filestyle/bootstrap-filestyle.min.js"></script>
      <!-- Animo-->
      <script src="admin/vendor/animo/animo.min.js"></script>
      <!-- Sparklines-->
      <script src="admin/vendor/sparklines/jquery.sparkline.min.js"></script>
      <!-- Slimscroll-->
      <script src="admin/vendor/slimscroll/jquery.slimscroll.min.js"></script>
      <!-- START Page Custom Script-->
      <!-- END Page Custom Script-->
       <!--  Flot Charts-->
      <script src="admin/vendor/flot/jquery.flot.min.js"></script>
      <script src="admin/vendor/flot/jquery.flot.tooltip.min.js"></script>
      <script src="admin/vendor/flot/jquery.flot.resize.min.js"></script>
      <script src="admin/vendor/flot/jquery.flot.pie.min.js"></script>
      <script src="admin/vendor/flot/jquery.flot.time.min.js"></script>
      <script src="admin/vendor/flot/jquery.flot.categories.min.js"></script>
      <!--[if lt IE 8]><script src="js/excanvas.min.js"></script><![endif]-->
      <!-- App Main-->
      <script src="admin/app/js/app.js"></script>
      <!-- END Scripts-->
     </body>
   
   </html>
   <?php
   }
}
?>