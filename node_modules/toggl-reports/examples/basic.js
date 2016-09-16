var Reports = require('../lib/toggl-reports.js');
var reports = new Reports('--your-token--');
var workspace = '--your-workspace--id';

reports.weekly({workspace_id: workspace}, function(err, res){
  if(err){
    console.log(err);
  }
  console.log(res);
});

var detailedOptions = {
  workspace_id: workspace,
  since: '2014-04-01',
  until: '2014-04-30'
}

reports.detailed(detailedOptions, '2014-02-01', '2014-04-30', null, function(err, res){
  if(err){
    log(err);
  }
  console.log(res);
});

var summaryOptions = {
  workspace_id: workspace,
  since: '2014-04-01',
  until: '2014-04-30'
}

reports.summary(workspaceId, '2014-02-01', '2014-04-30', null, null, function(err, res){
  if(err){
    log(err);
  }
  console.log(res);
});