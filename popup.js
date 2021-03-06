var append = function(text){
  data.appendChild(document.createTextNode(text));
}

function getHistory () {
  var deferred = Q.defer();

  chrome.history.search({
    'text': '', 
    // 'maxResults': 100, 
    'maxResults': 100000, 
    'startTime': 0
  }, function(res){
    deferred.resolve(res);
  });

  return deferred.promise;
}

function getVisits (historyItem) {
  var deferred = Q.defer();

  chrome.history.getVisits({
    url: historyItem.url
  }, function (visits) {
    historyItem.visits = visits;
    deferred.resolve(historyItem);
  });

  return deferred.promise;
}

function getAllVisits(historyItems) {
  var promiseArray = [];

  for (var i = 0; i < historyItems.length; i++) {
    promiseArray.push(getVisits(historyItems[i]));
  }

  return Q.all(promiseArray);
}

var download = function(format){
  document.getElementById('content').innerText = "preparing file...";

  getHistory()
  .then(getAllVisits)
  .then(function (res) {
    window.res = res;

    var text, filename;

    // put the data in a hidden div so chrome doesn't crash
    if(format==="csv"){
      filename = "history.csv";

      // header row
      var keys = Object.keys(res[0]);
      append(keys.join(","));

      var row;
      for(var i=0; i<res.length; i++){
        row = "";
        for(var j=0; j<keys.length; j++){
          row += JSON.stringify(res[i][keys[j]]);
          if(j !== keys.length-1) row += ",";
        }
        append("\n" + row);
      }
    }else{
      filename = "history.json";

      append("[");
      for(var i=0; i<res.length; i++){
        text = JSON.stringify(res[i]);
        if(i !== res.length-1) text = text + ',';
        append(text);
      }
      append("]");
    }

    window.blob = new Blob([data.innerText], {type: 'application/octet-binary'});
    window.url = URL.createObjectURL(blob);

    var pom = document.createElement('a');
    pom.setAttribute('href', url);
    pom.setAttribute('download', filename);
    pom.click();

    window.close();
  })
  .done();
}

document.addEventListener('DOMContentLoaded', function () {
  window.data = document.getElementById('data');

  document.getElementById('json').onclick = function(){
    download('json');
  };

  document.getElementById('csv').onclick = function(){
    download('csv');
  };
});

