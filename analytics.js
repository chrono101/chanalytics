var global_threadData;

$( document ).ready(function() {
  getBoardsListing();

  $("#board").change(function() {
    getThreadsListing();
  });

  $("#getStatsBtn").click(function() {
    getThreadStats();
  });

  // This is to automatically resize Google charts on tab changes
  $('a[data-toggle="tab"].timeline-tab').on('shown.bs.tab', function (e) {
    analytic_timeline(global_threadData);
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
      analytic_generalStats(data);    
      analytic_timeline(data);
      analytic_images(data);    
      analytic_wordCounts(data);  
    }
  });  
  return;
}

function analytic_generalStats(thread) {
  $("#generalStats-OpTime").html(thread.posts[0].time);
  $("#generalStats-Replies").html(thread.posts[0].replies);
  $("#generalStats-Images").html(thread.posts[0].images + 1);
  return;
}

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

function analytic_images(thread) {
var largestImageDimensions = 0;
var largestImageFs = 0;
var fileNameCounts = [];
var fileExtCounts = [];
var fileSourceCounts = [];

$.each(thread.posts, function (i, post) {
  // Check fle dimensions, update max if needed
  if ((post.w * post.h) > largestImageDimensions) {
    largestImageDimensions = (post.w * post.h);
    $("#imageStats-largestDimensions").html(post.w + "x" + post.h);
    $("#imageStats-largestDimensionsFn").html("<abbr title=\"" + post.filename + post.ext + "\">" + post.filename.slice(0,18) + "</abbr>");
  }
  // Check filesize, update max if needed
  if (post.fsize > largestImageFs) {
    largestImageFs = post.fsize;
    $("#imageStats-largestFilesize").html(bytesToSize(post.fsize));
    $("#imageStats-largestFilesizeFn").html("<abbr title=\"" + post.filename + post.ext + "\">" + post.filename.slice(0,18) + "</abbr>");
  }
  // If there is an image
  if (post.filename) {
    // Update the filename and file extension counts
    if (!fileNameCounts[post.filename]) {
      fileNameCounts[post.filename] = 0;
    }
    if (!fileExtCounts[post.ext] ) {
      fileExtCounts[post.ext] = 0;
    }
    fileNameCounts[post.filename] = fileNameCounts[post.filename] + 1;
    fileExtCounts[post.ext] = fileExtCounts[post.ext] + 1;
    // Update the image source counts
    if ((post.filename.charAt(0) == "1") && (post.filename.length == 13)) {
      fileSourceCounts["4chan"] = (Number(fileSourceCounts["4chan"]) || 0) + 1;
    } else if (post.filename.slice(0,7) == "tumblr_") {
      fileSourceCounts["Tumblr"] = (Number(fileSourceCounts["Tumblr"]) || 0) + 1;
    } else if (post.filename.length == 7) {
      fileSourceCounts["Imgur"] = (Number(fileSourceCounts["Imgur"]) || 0) + 1;
    } else if (post.filename.slice(-2) == "_n" || post.filename.slice(-2) == "_o" || post.filename.slice(-2) == "_s") {
      fileSourceCounts["Facebook"] = (Number(fileSourceCounts["Facebook"]) || 0) + 1;
    } else if (post.filename.slice(0, 3) == "DSC" || post.filename.slice(0,3) == "IMG" || post.filename.slice(0,4) == "IMAG") {
      fileSourceCounts["Camera"] = (Number(fileSourceCounts["Camera"]) || 0) + 1;
    } else {
      fileSourceCounts["Unknown"] = (Number(fileSourceCounts["Unknown"]) || 0) + 1;
    }
  }
});

var nameCountsString = "";
for(var filename in fileNameCounts){
nameCountsString = nameCountsString + ("<tr><td>" + filename + "</td><td>" + fileNameCounts[filename] + "</td></tr>");
}var extCountsString = "";
for (var ext in fileExtCounts) {
extCountsString = extCountsString + ("<tr><td>" + ext + "</td><td>" + fileExtCounts[ext] + "</td></tr>");
}$("#imageStats-FileTypeFreqs").html(extCountsString);
$("#imageStats-FnFreqs").html(nameCountsString);

var sortedFileSourceCounts = []
for (var source in fileSourceCounts) {
sortedFileSourceCounts.push([source, (fileSourceCounts[source])]);
}sortedFileSourceCounts.sort(function (a, b) { return a[1] - b[1]});
var sourceCountsString = "";
for (var i = 0; i < sortedFileSourceCounts.length; i++) {
sourceCountsString = ("<tr><td>" + sortedFileSourceCounts[i][0] + "</td><td>" + sortedFileSourceCounts[i][1] + "</td></tr>") + sourceCountsString;
}//sourceCountsString = "<thead><tr><td>Source</td><td>No. Images</td></tr></thead>" + sourceCountsString;
$("#imageStats-ImageSources").html(sourceCountsString);

return;
}

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

function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Bytes';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};