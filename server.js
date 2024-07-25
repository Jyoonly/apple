const express = require('express') // express 라이브러리 사용
const app = express()
const { MongoClient, ObjectId } = require('mongodb')
const methodOverride = require('method-override')

// public 폴더 내의 파일을 활용할 수 있게됨. static 파일(=css, 이미지, js파일 등)
app.use(express.static(__dirname + '/public'))
// ejs 셋팅. html파일에 데이터를 꽂기 위함. 
app.set('view engine', 'ejs')
// 요청.body위해 필요
app.use(express.json())
app.use(express.urlencoded({extended:true}))
// 메쏘드오버라이드
app.use(methodOverride('_method'))


// 몽고db 연결위해 셋팅하는 코드


let db
const url = 'mongodb+srv://admin:qwer1234@cluster0.18kx7zc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('apple')
    // 서버 띄우는 코드
    app.listen(8080, () => { //포트번호: 8080
        console.log('http://localhost:8080 에서 서버 실행중')
    })
}).catch((err)=>{
  console.log(err)
})




// 누가 메인페이지 접속시 
app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html')
               //현재 프로젝트 절대경로
})

// 새로운 페이지 
app.get('/news', (요청, 응답) => {
    db.collection('post').insertOne({title : '화귀또봐라'})
    // 응답.send('충격 최신화! ')
})


// 컬렉션의 모든 document 출력 방법 (중요! 암기 합시다.)
//      다른 DB도 사용법은 비슷! 
app.get('/list', async (요청, 응답) => {
    let result = await db.collection('post').find().toArray()
            // await: 다음 줄 실행 말고 기다려주세요. 정해진 곳만 붙일수있다.
    //console.log(result[0].title) // 우리 터미널에 뜸
    //응답.send(result[0].title) // 유저한테 뜸

    응답.render('list.ejs', { 글목록 : result }) //ejs 보내기 + 응답은 한개만 가능. 
}) 

app.get('/write', (요청, 응답) => {
    응답.render('write.ejs')
})

app.post('/add', async (요청, 응답) => {
    console.log(요청.body)

    // 숙제 : 글을 DB에 저장
    //db.collection('post').insertOne(요청.body)
    
    try { // 여기 실행해보고
        // 예외처리
        if (요청.body.title == '') {
            응답.send('제목입력해라')
        } else {
            //정답
            await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content})
            응답.redirect('/list') // 유저를 다른 페이지로 이동시킴
        }
    } catch(e) { // 에러시 여기를 실행
        console.log(e) // 에러메세지 출력해줌
        응답.status(500).send('서버에러남') //500은 서버로 인한 에러라는뜻 
    }
    
})


app.get('/detail/:id', async (요청, 응답) => {

    try {
        let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) }) // {} 포함된 첫번째 도큐먼트 가져옴 
        if (result == null) {
            응답.status(400).send('이상한 url 입력이라고')
        }
        응답.render('detail.ejs', { result : result })
    } catch(e){
        console.log(e)
        응답.status(400).send('이상한 url 입력')

    }
  })

app.get('/edit/:id', async (요청, 응답) => {

    let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) })
    console.log(result)
    응답.render('edit.ejs', { result : result })
})

app.put('/edit', async (요청, 응답) => {
    
    // await db.collection('post').updateOne({ _id : 1 }, 
    //     {$inc: { like : 1 }}
    // )

    let result = await db.collection('post').updateOne({ _id : new ObjectId(요청.body.id) }, // 어디서 찾음? 서버는 모른다 => 유저는 알 것이다. or db에서 꺼내보거나  
        {$set : { title : 요청.body.title, content : 요청.body.content }} // 요청.body
        )
    console.log(result)
    응답.redirect('/list')
    
})

app.delete('/delete', async (요청, 응답) => {
    //console.log(요청.query)
    await db.collection('post').deleteOne({ _id : new ObjectId(요청.query.docid) })
    응답.send('삭제완료') // ajax 요청 사용시, 응답.redirect, 응답.render 사용 안하는게 나음 (얜 새고 안되는게 장점이니까!)
})
    

app.get('/abc', async (요청, 응답) => {
    console.log(요청.query)
})





////////////// 숙제 ////////////////////
app.get('/about', (요청, 응답) => {
    응답.sendFile(__dirname + '/whoami.html')
               //현재 프로젝트 절대경로 
})

new Date()

app.get('/time', (요청, 응답) => {
    응답.render('time.ejs', {data: new Date()})
})

// app.get('/detail/:id', async (요청, 응답) => { 
// // '/detail/어쩌구' 로 접속하면 모두 처리 가능 
//     //숙제 코드
//     let id = 요청.params.aaa
//     //console.log(id)
//     let result = await db.collection('post').findOne({ _id : new ObjectId(id) }) // {} 포함된 첫번째 도큐먼트 가져옴 
//     console.log(result)
//     응답.render('detail.ejs', { 게시물 : result})
// })