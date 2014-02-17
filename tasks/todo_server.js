/*
 * grunt-todo-server
 * https://github.com/kennethcachia/grunt-todo-server
 *
 * Copyright (c) 2014 Kenneth Cachia
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerTask('todo_server_start', 'Grunt todo server - Start server', function () {
    var options = this.options({
      port: 9000,
      hostname: 'localhost',
      open: false,
      output: 'todo_server'
    });

    var connect = require('connect');
    var middleware = [connect.static(options.output)];
    var app = connect.apply(null, middleware);
    var http = require('http');
    var server = http.createServer(app);
    var open = require('open');

    server.listen(options.port, options.hostname);

    server.on('listening', function () {
      var address = server.address();
      var hostname = options.hostname || address.address || 'localhost';
      var target = 'http://' + options.hostname + ':' + address.port;

      grunt.log.writeln('Started todo_server on ' + target);

      if (options.open) {
        open(target);
      }
    });

    server.on('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        grunt.fatal('Port ' + options.port + ' is already in use by another process');
      } else {
        grunt.fatal(err);
      }
    });

    this.async();
    app.listen(options.port);
  });


  grunt.registerMultiTask('todo_server_extract', 'Grunt todo server - Extract todos', function () {
    var src = this.data.src;

    var options = this.options({
      output: 'todo_server'
    });

    var match;
    var raw;
    var todos = {};
    var key;

    var regex = /(TODO):(.*)/ig;

    src.forEach(function (filename) {
      grunt.log.write('\nProcessing ' + filename + ' - ');

      key = todos[filename] = [];
      raw = grunt.file.read(filename);

      while ((match = regex.exec(raw)) !== null) {
        key.push({
          raw: match[0],
          prefix: match[1].toLowerCase(),
          comment: match[2]
        });
      }

      grunt.log.ok();
    });

    // Generate todos
    var output = 'var TODO_DATA = ' + JSON.stringify(todos) + ';';
    grunt.file.write(options.output + '/todos.js', output);

    // Copy static files
    grunt.file.copy('static/index.html', options.output + '/index.html');
    grunt.file.copy('static/scripts.min.js', options.output + '/scripts.min.js');
  });
};
