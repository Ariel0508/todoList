//create server
const http = require("http");//內建http模組
const { v4: uuidv4 } = require("uuid");//載入外部v4模組
const errorHandle = require("./errorHandle")//自定義errorHandle
const todos = [];

const requestListener = (req, res) => {
    //用於跨來源請求時的 CORS（跨來源資源共享）設定，以及通用的 HTTP header 設定。透過這些設定，可以有效地控制和管理客戶端與伺服器端之間的資料交換和請求行為。
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
        "Content-Type": "application/json"
    }
    console.log(req.url);
    console.log(req.method);
    //接收 POST API 的 body 資料
    let body = "";
    req.on("data", (chunk) => {
        // console.log(chunk);
        body += chunk
    })
    //判斷非index頁面，回傳404
    if (req.url == "/todos" && req.method == "GET") {
        //標頭內容
        res.writeHead(200, headers);
        //寫入資料
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        //結束
        res.end();
    } else if (req.url == "/todos" && req.method == "POST") {
        req.on("end", () => {
            //新增 POST API 異常行為 => try-catch 
            //1.req.body是否為JSON格式
            try {
                const title = JSON.parse(body).title;
                // console.log(title);
                //2.物件是否有title屬性
                if (title !== undefined) {
                    const todo = {
                        "title": title,
                        "id": uuidv4(),
                    }
                    todos.push(todo);
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }))
                    res.end();
                    // console.log(JSON.parse(body));
                    //body typeof為string，要轉為物件才能取得title
                    // console.log(JSON.parse(body).title);
                } else {
                    errorHandle(res)
                    // res.writeHead(400, headers);
                    // res.write(JSON.stringify({
                    //     "status": "fail",
                    //     "message":"欄位輸入錯誤，或無此todo id"
                    // }))
                    // res.end();
                }
            } catch {
                errorHandle(res)
                // res.writeHead(400, headers);
                // res.write(JSON.stringify({
                //     "status": "fail",
                //     "message":"欄位輸入錯誤，或無此todo id"
                // }))
                // res.end();
            }
        })
    } else if (req.url == "/todos" && req.method == "DELETE") {
        //設定 全部刪除 DELETE API，不用用req.on("end")因為沒有接收body
        todos.length = 0;//清空todos
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
        //1.startsWith("/todos/")字串檢索，判斷路由是否為刪除單筆todo
        //2.todo id是否存在 用split('/')切割字串，取得id，再用pop()回傳刪除的最後一項(uuid)
        const id = req.url.split('/').pop();
        //3.findIndex() 判斷id是否和todos中的id相同，相同則刪除(splice(index, 1))
        const index = todos.findIndex(item => item.id == id)
        // console.log(index, id);
        //若index !== -1(有找到id)才執行
        if (index !== -1) {
            todos.splice(index, 1);
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": todos,
            }));
            res.end();
        } else {
            errorHandle(res)
        }
    } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
        //編輯單筆todo PATCH API
        //有接收body要用req.on("end")
        req.on('end', () => {
            //判斷是否為JSON格式 try-catch  && 物件是否有title屬性 && todo id是否存在
            try{
                const todo = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(item=> item.id == id);
                if (todo !== undefined && index !== -1) {
                    //編輯單筆todo
                    todos[index].title = todo;
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                } else {
                    errorHandle(res);
                }
            }catch{
                errorHandle(res);
            }
        })
    }
    else if (req.url == "/todos" && req.method == "OPTIONS") {
        //設定 options API
        res.writeHead(200, headers)
        res.end();
    } else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "fail",
            "message": "page not found",
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(3005);





//uuid
// const { v4: uuidv4 } = require("uuid");
// // console.log(uuidv4());
// const a = uuidv4();
// console.log("qq", a);

// const obj = {
//     "title":"todoList",
//     "id":uuidv4()
// }

// console.log(obj)