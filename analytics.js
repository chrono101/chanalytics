var global_threadData;

$( document ).ready(function() {
  getBoardsListing(); 

  $("#board").change(function() {    
    getThreadsListing();    
  });
  
  $("#getThreadsBtn").click(function() {
    getThreadsListing();
  });

  $("#getStatsBtn").click(function() {
    var $this = $(this);
    if ($this.hasClass("btn-disabled")) {      
      return;
    }
    // Countdown timer on the button to prevent spamming
    $this.toggleClass("btn-primary").toggleClass("btn-disabled");    
    var counter = 10;
    setInterval(function() {
      counter--;
      if (counter >= 0) {
        $this.text("Wait " + counter);
      }
      if (counter == 0) {
        clearInterval(counter)
        $("#getStatsBtn").toggleClass("btn-disabled").toggleClass("btn-primary");
        $("#getStatsBtn").text("Analyze");
      }
    }, 1000);
    
    getThreadStats();
  });

  // This is to automatically resize Google charts on tab changes
  $('a[data-toggle="tab"].timeline-tab').on('shown.bs.tab', function (e) {
    analytic_timeline(global_threadData);    
  });
  
  $('a[data-toggle="tab"].reply-tab').on('shown.bs.tab', function (e) {
    analytic_replies(global_threadData);
  });
});

// Gets boards listing and populates select element
function getBoardsListing() {
  // Perform JSON request
  var chan_url = "http://a.4cdn.org/boards.json";
  var yql_url = 'http://query.yahooapis.com/v1/public/yql';
  var data = {
    'q': 'SELECT * FROM json WHERE url="'+ chan_url +'"',
    'format': 'json',
    'jsonCompat': 'new',
  }
  
  $.ajax({
    'url': yql_url,
    'data': {
      'q': 'SELECT * FROM json WHERE url="'+ chan_url +'"',
      'format': 'json',
      'jsonCompat': 'new',
    },
    'dataType': 'jsonp',
    'success': function(response) {
      // console.log(response)
      var data = response.query.results.json; // This is gross
      $.each(data.boards, function (i, item) {
        var worksafe = "";
        var posts = 0;
        if (item.ws_board == 1) { worksafe = "Worksafe" } else { worksafe = "NSFW" }
        var posts = (item.per_page * item.pages);
        $("#board").append("<option value=\"" + item.board + "\">/" + item.board + "/ - " + item.title + " (" + worksafe + ", " + posts + " threads)</option>");
      });
    },
  });  
  return;
}

// Gets threads listing for the selected board and populates a select element
function getThreadsListing() {
  // Clear last choice
  $("#thread").empty();
  // Perform JSON request
  var selectedBoard = $("#board").val();
  var chan_url = "http://a.4cdn.org/" + selectedBoard + "/catalog.json";
  var yql_url = 'http://query.yahooapis.com/v1/public/yql';
  var data = {
    'q': 'SELECT * FROM json WHERE url="'+ chan_url +'"',
    'format': 'json',
    'jsonCompat': 'new',
  }  
  
  $.ajax({
    'url': yql_url,
    'data': {
      'q': 'SELECT * FROM json WHERE url="'+ chan_url +'"',
      'format': 'json',
      'jsonCompat': 'new',
    },
    'dataType': 'jsonp',
    'success': function(response) {
      // console.log(response)
      var data = response.query.results.json.json; // What the fug
      $.each(data, function (i, page) {
        $.each(page.threads, function (j, item) {
          var subject = "";
          if (item.sub) {
            subject = item.sub;
          } else {
            subject = "No Subject";
          }
          $("#thread").append("<option value=\"" + item.no + "\">No. " + item.no+ " - " + item.replies + " replies - " +subject + "</option>");
        });
      });
    },
  });    
  return;
}

function getThreadStats() {
  // Perform JSON request
  var selectedBoard = $("#board").val();
  var selectedThread = $("#thread").val();
  var chan_url = "http://a.4cdn.org/" + selectedBoard + "/res/" + selectedThread + ".json";
  var yql_url = 'http://query.yahooapis.com/v1/public/yql';
  var data = {
    'q': 'SELECT * FROM json WHERE url="'+ chan_url +'"',
    'format': 'json',
    'jsonCompat': 'new',
  }  
  
  $.ajax({
    'url': yql_url,
    'data': {
      'q': 'SELECT * FROM json WHERE url="'+ chan_url +'"',
      'format': 'json',
      'jsonCompat': 'new',
    },
    'dataType': 'jsonp',
    'success': function(response) {
      // console.log(response)
      var data = response.query.results.json; // What the fug 2
      global_threadData = data;    
      $("#thread-link").attr("href", "http://boards.4chan.org/" + selectedBoard + "/res/" + selectedThread);
      $("#thread-link").text("/" + selectedBoard + "/" + selectedThread);    
      analytic_replies(data);    
      analytic_timeline(data);
      analytic_images(data);    
      analytic_wordCounts(data);  
    }
  });  
  return;
}

/******************************
* Reply Analytics
******************************/
function analytic_replies(thread) {
// General Stats
$("#replyStats-opTime").html(new Date(thread.posts[0].time * 1000));
if (thread.posts[0].com) {
  $("#replyStats-opSnippet").html("<em>\"" + thread.posts[0].com.slice(0, 50) + "\"</em>");
}
$("#replyStats-replies").html(thread.posts[0].replies);
$("#replyStats-images").html(thread.posts[0].images + 1);
  
// Reply type pie chart
var repliesArray = [["Reply Type", "Replies"],
                            ["Image and Comment", 0],
                            ["Image Only", 0],
                            ["Comment Only", 0],
                            ["Unknown", 0]
                           ];
var repliesPC_container = document.getElementById("reply-type-chart");
var repliesPC_chart = new google.visualization.PieChart(repliesPC_container);
$.each(thread.posts, function(i, post) {
  if (post.filename && post.com) {
    // Image and Comment
    repliesArray[1][1] = repliesArray[1][1] + 1;
  } else if (post.filename && !post.com) {
    // Image Only
    repliesArray[2][1] = repliesArray[2][1] + 1;
  } else if (!post.filename && post.com) {
    // Comment Only
    repliesArray[3][1] = repliesArray[3][1] + 1;
  } else {
    // Unknown
    repliesArray[4][1] = repliesArray[4][1] + 1;
  }  
});
var repliesPC_dataTable = google.visualization.arrayToDataTable(repliesArray);
repliesPC_chart.draw(repliesPC_dataTable, { });

// Country Map
  var countriesArray = [];
  var countriesDataTable = [["Country", "Posts"]];
  $.each(thread.posts, function(i, post) {
    if (post.country != "XX") {
      countriesArray[post.country] = Number(countriesArray[post.country] || 0) + 1;
    }
  });
  for (var country in countriesArray) {
    countriesDataTable.push([country, countriesArray[country]]);
  }
  var geoChart_options = { colorAxis: {colors: ["#FF0000", "#FFFF00", "#008000"] } };
  var geoChart_container = document.getElementById("reply-map");
  var geoChart_chart = new google.visualization.GeoChart(geoChart_container);
  var geoChart_dataTable = new google.visualization.DataTable();  
  geoChart_dataTable = google.visualization.arrayToDataTable(countriesDataTable);
  geoChart_chart.draw(geoChart_dataTable, geoChart_options);

// Timing Stats
// Do nothing if only 1 reply
if (thread.posts[0].replies > 0) {
  var length = thread.posts[thread.posts.length - 1].time - thread.posts[0].time;
  var firstGap = thread.posts[1].time - thread.posts[0].time;
  var repliesPerMinute = thread.posts[0].replies / ((thread.posts[thread.posts.length - 1].time - thread.posts[0].time) / 60);
  var avgTime = 0;
  var longestTime = 0;
  var shortestTime = 4294967296; // 2^32
  // Now find average, longest, shortest
  var totalTime = 0;
  for (var i = 0; i < thread.posts.length - 2; i++) {
    var time = thread.posts[i + 1].time - thread.posts[i].time;
    if (time > longestTime) {
      longestTime = time;
    }
    if (time < shortestTime) {
      shortestTime = time;
    }
    totalTime = totalTime + time;
  }
  avgTime = totalTime / thread.posts[0].replies;
  
  // Update the Table
  $("#replyStats-timingLength").html(secondsToString(length));
  $("#replyStats-timingFirst").html(secondsToString(firstGap));
  $("#replyStats-timingPerMinute").html(repliesPerMinute.toPrecision(3) + " replies/minute");
  $("#replyStats-timingAvgTime").html(secondsToString(avgTime.toPrecision(3)));
  $("#replyStats-timingLongestTime").html(secondsToString(longestTime));
  $("#replyStats-timingShortestTime").html(secondsToString(shortestTime));
}
return;
}

 /******************************
* Timeline Analytics
******************************/
function analytic_timeline(thread) {
// Timeline options will be the same across all timelines
var TL_options = {};

// Replies Timeline
var repliesTL_container = document.getElementById("timeline-replies");
var repliesTL_chart = new google.visualization.Timeline(repliesTL_container);
var repliesTL_dataTable = new google.visualization.DataTable();
repliesTL_dataTable.addColumn({ type: "string", id: "Type" });
repliesTL_dataTable.addColumn({ type: "string", id: "Reply No." });
repliesTL_dataTable.addColumn({ type: "date", id: "Start" });
repliesTL_dataTable.addColumn({ type: "date", id: "End" });
repliesArray = [];

$.each(thread.posts, function(i, post) {
  var replyDate = new Date(post.time*1000);
  // Add one to the "All" category
  var allReplyArray = ["All Replies", "No. " + String(post.no), replyDate, replyDate];
  repliesArray.push(allReplyArray);
  // Determine if image only, comment only, or both, and then add to category
  if (post.filename && post.com) {
    var replyArray = ["Image and Comment", "No. " + String(post.no), replyDate, replyDate];
  } else if (post.filename && !post.com) {
    var replyArray = ["Image Only", "No. " + String(post.no), replyDate, replyDate];
  } else if (!post.filename && post.com) {
    var replyArray = ["Comment Only", "No. " + String(post.no), replyDate, replyDate];
  } else {
    var replyArray = ["Unknown", "No. " + String(post.no), replyDate, replyDate];
  }
  repliesArray.push(replyArray);
});
repliesTL_dataTable.addRows(repliesArray);
repliesTL_chart.draw(repliesTL_dataTable, TL_options);

// Names Timeline
var nameTL_container = document.getElementById("timeline-names");
var nameTL_chart = new google.visualization.Timeline(nameTL_container);
var nameTL_dataTable = new google.visualization.DataTable();
nameTL_dataTable.addColumn({ type: "string", id: "Name" });
nameTL_dataTable.addColumn({ type: "string", id: "Reply No." });
nameTL_dataTable.addColumn({ type: "date", id: "Start" });
nameTL_dataTable.addColumn({ type: "date", id: "End" });
repliesArray = [];
$.each(thread.posts, function(i, post) {
  var replyDate = new Date(post.time*1000);
  var replyArray = [unescape(String(post.name)), "No. " + String(post.no), replyDate, replyDate];
  repliesArray.push(replyArray);
});
nameTL_dataTable.addRows(repliesArray);
nameTL_chart.draw(nameTL_dataTable, TL_options);

// IDs Timeline
var idTL_container = document.getElementById("timeline-ids");
var idTL_chart = new google.visualization.Timeline(idTL_container);
var idTL_dataTable = new google.visualization.DataTable();
idTL_dataTable.addColumn({ type: "string", id: "ID" });
idTL_dataTable.addColumn({ type: "string", id: "Reply No." });
idTL_dataTable.addColumn({ type: "date", id: "Start" });
idTL_dataTable.addColumn({ type: "date", id: "End" });
repliesArray = [];
$.each(thread.posts, function(i, post) {
  var replyDate = new Date(post.time*1000);
  if (post.id) {
    var replyArray = [unescape(String(post.id)), "No. " + String(post.no), replyDate, replyDate];
  } else {
    var replyArray = ["No ID", "No. " + String(post.no), replyDate, replyDate];
  }
  repliesArray.push(replyArray);
});
idTL_dataTable.addRows(repliesArray);
idTL_chart.draw(idTL_dataTable, TL_options);

// Countries Timeline
var countriesTL_container = document.getElementById("timeline-countries");
var countriesTL_chart = new google.visualization.Timeline(countriesTL_container);
var countriesTL_dataTable = new google.visualization.DataTable();
countriesTL_dataTable.addColumn({ type: "string", id: "Country" });
countriesTL_dataTable.addColumn({ type: "string", id: "Reply No." });
countriesTL_dataTable.addColumn({ type: "date", id: "Start" });
countriesTL_dataTable.addColumn({ type: "date", id: "End" });
repliesArray = [];
$.each(thread.posts, function(i, post) {
  var replyDate = new Date(post.time*1000);
  if (post.country_name) {
    var replyArray = [unescape(String(post.country_name)), "No. " + String(post.no), replyDate, replyDate];
  } else {
    var replyArray = ["No Country", "No. " + String(post.no), replyDate, replyDate];
  }
  repliesArray.push(replyArray);
});
countriesTL_dataTable.addRows(repliesArray);
countriesTL_chart.draw(countriesTL_dataTable, TL_options);

return;
}

/******************************
* Image Analytics
******************************/
function analytic_images(thread) {
var largestImageDimensions = 0;
var largestImageFs = 0;
var smallestImageDimensions = 100000000; // Max on /hr/
var smallestImageFs = 8388608; // Max on /hr/
var fileNameCounts = [];
var fileExtCounts = [];
var fileSourceCounts = [];
var fileRatios = [];
var file4chanReposts = [];

$.each(thread.posts, function (i, post) {
  // Check largest file dimensions, update max if needed
  if ((post.w * post.h) > largestImageDimensions) {
    largestImageDimensions = (post.w * post.h);
    $("#imageStats-largestDimensions").html(post.w + "x" + post.h);
    $("#imageStats-largestDimensionsThumb").html(generateImageThumb(post));
    $("#imageStats-largestDimensionsFn").html(post.filename + post.ext);
  }
  // Check largest filesize, update max if needed
  if (post.fsize > largestImageFs) {
    largestImageFs = post.fsize;
    $("#imageStats-largestFilesize").html(bytesToSize(post.fsize));
    $("#imageStats-largestFilesizeThumb").html(generateImageThumb(post));
    $("#imageStats-largestFilesizeFn").html(post.filename + post.ext);
  }
  // Check smallest file dimensions, update min if needed
  if ((post.w * post.h) < smallestImageDimensions) {
    smallestImageDimensions = (post.w * post.h);
    $("#imageStats-smallestDimensions").html(post.w + "x" + post.h);
    $("#imageStats-smallestDimensionsThumb").html(generateImageThumb(post));
    $("#imageStats-smallestDimensionsFn").html(post.filename + post.ext);
  }
  // Check smallest filesize, update min if needed
  if (post.fsize < smallestImageFs) {
    smallestImageFs = post.fsize;
    $("#imageStats-smallestFilesize").html(bytesToSize(post.fsize));
    $("#imageStats-smallestFilesizeThumb").html(generateImageThumb(post));
    $("#imageStats-smallestFilesizeFn").html(post.filename + post.ext);
  }
  // If there is an image
  if (post.filename) {
    // Update the filename and file extension counts    
    fileNameCounts[post.filename + post.ext] = (Number(fileNameCounts[post.filename]) || 0) + 1;
    fileExtCounts[post.ext] = (Number(fileExtCounts[post.ext]) || 0) + 1;
    // Update the image source counts
    var source = getImageSource(post.filename);
    fileSourceCounts[source] = (Number(fileSourceCounts[source]) || 0) + 1;      
    if (source == "4chan") {
      file4chanReposts[post.filename + post.ext] = post;
    }
    
    // Compute dimensions to filesize ratio
    var ratio = ((post.w * post.h) / post.fsize).toPrecision(3);
    fileRatios[post.filename + post.ext] = ratio;
  }
});

var nameCountsString = "";
for(var filename in fileNameCounts) {
  nameCountsString = nameCountsString + ("<tr><td>" + filename + "</td><td>" + fileNameCounts[filename] + "</td></tr>");
}
var extCountsString = "";
for (var ext in fileExtCounts) {
extCountsString = extCountsString + ("<tr><td>" + ext + "</td><td>" + fileExtCounts[ext] + "</td></tr>");
}
$("#imageStats-FileTypeFreqs").html(extCountsString);
$("#imageStats-FnFreqs").html(nameCountsString);

var sortedFileSourceCounts = [];
for (var source in fileSourceCounts) {
  sortedFileSourceCounts.push([source, (fileSourceCounts[source])]);
}
sortedFileSourceCounts.sort(function (a, b) { return a[1] - b[1]});
var sourceCountsString = "";
for (var i = 0; i < sortedFileSourceCounts.length; i++) {
  sourceCountsString = ("<tr><td>" + sortedFileSourceCounts[i][0] + "</td><td>" + sortedFileSourceCounts[i][1] + "</td></tr>") + sourceCountsString;
}
$("#imageStats-ImageSources").html(sourceCountsString);

var sortedFileRatios = [];
for (var filename in fileRatios) {
  sortedFileRatios.push([filename, (fileRatios[filename])]);
}
sortedFileRatios.sort(function (a, b) { return a[1] - b[1]});
var ratioString = "";
for (var i = 0; i < sortedFileRatios.length; i++) {
  ratioString = ("<tr><td>" + sortedFileRatios[i][0] + "</td><td>" + sortedFileRatios[i][1] + " b/px</td></tr>") + ratioString;
}
$("#imageStats-EmbeddedArchive").html(ratioString);

var repostsString = "";
var now = Date.now();
for (var filename in file4chanReposts) {
  var timestamp = Number(file4chanReposts[filename].filename.slice(0,10));
  var post = new Date(timestamp * 1000)
  var elapsed = now - post.getTime();
  repostsString = repostsString + ("<tr><td>" + generateImageThumb(file4chanReposts[filename]) + "</td><td>" + post + "</td><td>" + timeSince(post) + " ago</td></tr>");
}
$("#imageStats-4chanReposts").html(repostsString);

return;
}

/******************************
* Comment Analytics
******************************/
function analytic_wordCounts(thread) {
  var wordCounts = [];
  var commonWords = [' ', '', "it's", 'a','able','about','above','abroad','according','accordingly','across','actually','adj','after','afterwards','again','against','ago','ahead','ain\'t','all','allow','allows','almost','alone','along','alongside','already','also','although','always','am','amid','amidst','among','amongst','an','and','another','any','anybody','anyhow','anyone','anything','anyway','anyways','anywhere','apart','appear','appreciate','appropriate','are','aren\'t','around','as','a\'s','aside','ask','asking','associated','at','available','away','awfully','b','back','backward','backwards','be','became','because','become','becomes','becoming','been','before','beforehand','begin','behind','being','believe','below','beside','besides','best','better','between','beyond','both','brief','but','by','c','came','can','cannot','cant','can\'t','caption','cause','causes','certain','certainly','changes','clearly','c\'mon','co','co.','com','come','comes','concerning','consequently','consider','considering','contain','containing','contains','corresponding','could','couldn\'t','course','c\'s','currently','d','dare','daren\'t','definitely','described','despite','did','didn\'t','different','directly','do','does','doesn\'t','doing','done','don\'t','down','downwards','during','e','each','edu','eg','eight','eighty','either','else','elsewhere','end','ending','enough','entirely','especially','et','etc','even','ever','evermore','every','everybody','everyone','everything','everywhere','ex','exactly','example','except','f','fairly','far','farther','few','fewer','fifth','first','five','followed','following','follows','for','forever','former','formerly','forth','forward','found','four','from','further','furthermore','g','get','gets','getting','given','gives','go','goes','going','gone','got','gotten','greetings','h','had','hadn\'t','half','happens','hardly','has','hasn\'t','have','haven\'t','having','he','he\'d','he\'ll','hello','help','hence','her','here','hereafter','hereby','herein','here\'s','hereupon','hers','herself','he\'s','hi','him','himself','his','hither','hopefully','how','howbeit','however','hundred','i','i\'d','ie','if','ignored','i\'ll','i\'m','immediate','in','inasmuch','inc','inc.','indeed','indicate','indicated','indicates','inner','inside','insofar','instead','into','inward','is','isn\'t','it','it\'d','it\'ll','its','it\'s','itself','i\'ve','j','just','k','keep','keeps','kept','know','known','knows','l','last','lately','later','latter','latterly','least','less','lest','let','let\'s','like','liked','likely','likewise','little','look','looking','looks','low','lower','ltd','m','made','mainly','make','makes','many','may','maybe','mayn\'t','me','mean','meantime','meanwhile','merely','might','mightn\'t','mine','minus','miss','more','moreover','most','mostly','mr','mrs','much','must','mustn\'t','my','myself','n','name','namely','nd','near','nearly','necessary','need','needn\'t','needs','neither','never','neverf','neverless','nevertheless','new','next','nine','ninety','no','nobody','non','none','nonetheless','noone','no-one','nor','normally','not','nothing','notwithstanding','novel','now','nowhere','o','obviously','of','off','often','oh','ok','okay','old','on','once','one','ones','one\'s','only','onto','opposite','or','other','others','otherwise','ought','oughtn\'t','our','ours','ourselves','out','outside','over','overall','own','p','particular','particularly','past','per','perhaps','placed','please','plus','possible','presumably','probably','provided','provides','q','que','quite','qv','r','rather','rd','re','really','reasonably','recent','recently','regarding','regardless','regards','relatively','respectively','right','round','s','said','same','saw','say','saying','says','second','secondly','see','seeing','seem','seemed','seeming','seems','seen','self','selves','sensible','sent','serious','seriously','seven','several','shall','shan\'t','she','she\'d','she\'ll','she\'s','should','shouldn\'t','since','six','so','some','somebody','someday','somehow','someone','something','sometime','sometimes','somewhat','somewhere','soon','sorry','specified','specify','specifying','still','sub','such','sup','sure','t','take','taken','taking','tell','tends','th','than','thank','thanks','thanx','that','that\'ll','thats','that\'s','that\'ve','the','their','theirs','them','themselves','then','thence','there','thereafter','thereby','there\'d','therefore','therein','there\'ll','there\'re','theres','there\'s','thereupon','there\'ve','these','they','they\'d','they\'ll','they\'re','they\'ve','thing','things','think','third','thirty','this','thorough','thoroughly','those','though','three','through','throughout','thru','thus','till','to','together','too','took','toward','towards','tried','tries','truly','try','trying','t\'s','twice','two','u','un','under','underneath','undoing','unfortunately','unless','unlike','unlikely','until','unto','up','upon','upwards','us','use','used','useful','uses','using','usually','v','value','various','versus','very','via','viz','vs','w','want','wants','was','wasn\'t','way','we','we\'d','welcome','well','we\'ll','went','were','we\'re','weren\'t','we\'ve','what','whatever','what\'ll','what\'s','what\'ve','when','whence','whenever','where','whereafter','whereas','whereby','wherein','where\'s','whereupon','wherever','whether','which','whichever','while','whilst','whither','who','who\'d','whoever','whole','who\'ll','whom','whomever','who\'s','whose','why','will','willing','wish','with','within','without','wonder','won\'t','would','wouldn\'t','x','y','yes','yet','you','you\'d','you\'ll','your','you\'re','yours','yourself','yourselves','you\'ve','z','zero'];
  var htmlTags = ["br", "a", "span"];

$.each(thread.posts, function (i, post) {
  if (post.com) {
    post.com = post.com.replace(/(<([^>]+)>)/ig," "); // Strip HTML
    post.com = post.com.replace(/[?!.,()]/g,""); // Strip common punctuation
    var words = post.com.split(" ");

    for (var i = 0; i < words.length; i++) {
      var word = String(words[i].toLowerCase());
      if (commonWords.indexOf(word) == -1) {
        wordCounts[word] = (Number(wordCounts[word]) || 0) + 1;
      }
    }
  }
});

var sortedWordCounts = [];
for (var word in wordCounts) {
  sortedWordCounts.push([word,(wordCounts[word])]);
}
sortedWordCounts.sort(function (a, b) { return a[1] - b[1]});
var wordCountsString = "";
for (var i = 0; i < sortedWordCounts.length; i ++) {
  percentile = (100 * (i - 1) ) / (sortedWordCounts.length - 1);  
  if (percentile > 97) {
    // Add them in reverse order
    wordCountsString =("<tr><td>" + sortedWordCounts[i][0] + "</td><td>" + sortedWordCounts[i][1] + "</td><td>" + percentile.toPrecision(5) + "</td></tr>") + wordCountsString ;
  }
}
  wordCountsString = "<thead><tr><td>Word</td><td>Occurances</td><td>Percentile</td></tr></thead>" + wordCountsString;
  $("#wordCounts").html(wordCountsString);
  
return;
}

/******************************
* Helper Functions
******************************/
function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Bytes';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

function secondsToString(seconds) {
  var numdays = Math.floor((seconds % 31536000) / 86400); 
  var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  var numseconds = ((((seconds % 31536000) % 86400) % 3600) % 60).toPrecision(2);
  var string = ""
  if (numdays > 0) {
    string = numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
  } else if (numhours > 0) {
    string = numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
  } else if (numminutes > 0) {
    string = numminutes + " minutes " + numseconds + " seconds";
  } else {
    string = numseconds + " seconds";
  }
  return string;
}

/*
 * http://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
 */ 
function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

function getImageSource(filename) {
  var source = "";
  if ((filename.charAt(0) == "1") && (filename.length == 13)) {
    source = "4chan";
  } else if (filename.slice(0,7) == "tumblr_") {
    source = "Tumblr"
  } else if (filename.length == 7) {
    source = "Imgur";
  } else if (filename.slice(-2) == "_n" || filename.slice(-2) == "_o" || filename.slice(-2) == "_s") {
    source = "Facebook";
  } else if (filename.slice(0, 3) == "DSC" || filename.slice(0,3) == "IMG" || filename.slice(0,4) == "IMAG") {
    source = "Camera";
  } else {
    source = "Unknown";    
  }
  return source;
}

// Generates a URL to the image for the given post
function generateImageLink(post) {
 return "<a href=\"http://i.4cdn.org/" + $("#board").val() + "/" + post.tim + post.ext + "\">" + post.filename + post.ext + "</a>";
}

// Generates a thumbnail image for the given post
function generateImageThumb(post) {
  return "<a href=\"http://i.4cdn.org/" + $("#board").val() + "/" + post.tim + post.ext + "\"><img src=\"http://t.4cdn.org/" + $("#board").val() + "/" + post.tim  + "s.jpg\" /></a>";
}