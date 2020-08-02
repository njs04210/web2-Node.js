var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    //console.log(pathname);
    if (pathname === '/') {
      //home일때의 경우 . web눌렀을 때. 홈으로 들어왔을 때.
      if (queryData.id === undefined ) {
          fs.readdir('./data', function(error, filelist){

            var title = "Welcome";
            var description = "Hello, Node.js";
            var list = template.list(filelist);
            var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
          });

//HTML, CSS, JavaScript 눌렀을때. id값이 있는 애
      } else {
        fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', (err, description) => {
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list, `<h2>${title}</h2>${description}`,
          ` <a href="/create">create</a>
            <a href="/update?id=${title}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <input type="submit" value="delete">
            </form>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if(pathname === '/create'){ //create 눌렀을 때
    fs.readdir('./data', function(error, filelist){

      var title = "WEB - create";
      var list = template.list(filelist);
      var html = template.HTML(title, list, `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `, '');
      response.writeHead(200);
      response.end(html);
    })
  } else if(pathname === '/create_process') { //제출 버튼 눌렀을 때

    var body ='';
    request.on('data', function(data) {
        body = body + data;
    });
    //request쓰는이유 : 사용자가 요청한 정보안에 post가 있을테니까.
    request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        }) //err 에러가 있을경우 에러를 처리하는 방법을 제공.
        //콜백이 실행된다는 것은 파일이 저장이 끝났다는 얘기. 그 다음 success해주는 코드
        //console.log(post.title);
    });
    //update를 눌렀을 때
  } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
      fs.readFile(`data/${queryData.id}`, 'utf8', (err, description) => {
        var title = queryData.id;
        var list = template.list(filelist);
        var html = template.HTML(title, list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value = "${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if(pathname === '/update_process') {
    var body ='';
    request.on('data', function(data) {
        body = body + data;
    });
    //request쓰는이유 : 사용자가 요청한 정보안에 post가 있을테니까.
    request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(error) {
          fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
        });
    });
  } else if(pathname === '/delete_process') {
    var body ='';
    request.on('data', function(data) {
        body = body + data;
    });
    //request쓰는이유 : 사용자가 요청한 정보안에 post가 있을테니까.
    request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        fs.unlink(`data/${id}`, function(error) {
          response.writeHead(302, {Location: `/`}); //삭제하면 홈으로 보내버리게끔
          response.end();
        })
    });
  } else { //이도저도 아닌것은 404 로 처리
      response.writeHead(404);
      response.end('Not found');
    }

    //response.end(fs.readFileSync(__dirname + _url));


});
app.listen(3000);
