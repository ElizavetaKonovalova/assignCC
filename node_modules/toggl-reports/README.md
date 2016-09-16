# toggl-reports [![Build Status](https://secure.travis-ci.org/anthonyringoet/toggl-reports.png?branch=master)](http://travis-ci.org/anthonyringoet/toggl-reports)

 Toggl Reports api wrapper

## Getting Started
Install the module with: `npm install toggl-reports`


## Documentation
See the [official Toggl API report docs](https://github.com/toggl/toggl_api_docs/blob/master/reports.md) for detailed info.

## API

### Init your api client

```
var Reports = require('toggl-reports');
var reports = new Reports('--your-api-token--');
```

### Reports.weekly(options|workspace_id:string, fn)

options can contain:

- workspace_id (required)

Alternatively, you can just pass the workspace_id as a string directly.


```
reports.weekly(options, function(err, res){
	if(err) console.log(err);

	console.log(res);
});

// or the other option for the weekly call

reports.weekly('--your-workspace-id--', function(err, res){
  if(err) console.log(err);

  console.log(res);
});

```

### Reports.detailed(options, fn)

options can contain:

- workspace_id (required)
- since
- until
- page

```
reports.detailed(options, function(err, res){
  if(err){
    log(err);
  }
  console.log(res);
});

```

### Reports.summary(options, fn)

options can contain:

- workspace_id (required)
- since
- until
- grouping
- subgrouping

```
reports.summary(options, function(err, res){
  if(err){
    log(err);
  }
  console.log(res);
});

```


## License
Copyright (c) 2014 Anthony Ringoet. Licensed under the MIT license.
