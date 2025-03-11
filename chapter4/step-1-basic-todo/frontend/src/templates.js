// 할 일 목록의 화면 렌더링 형성
// 데이터를 받아서 화면에 표시하는 역할
'use strict'

// 여러 개의 함수를 외부에서 사용할 수 있도록 내보내는 역할로 해당 파일을 다른 자바스크립트 파일에서 불러와 사용 가능
export { todoListTpl, editTpl, addTpl, errTpl, navBarTpl, navBarScheduleTpl }

// 개별적인 할일 항목을 만드는 함수
function todoItemTpl (item) {
  return `
    <div id="${item.id}" class="row list-group-item d-flex justify-content-between align-items-center">
      <div class="col-sm-1"></div>
      <div id="due-date" class="col-sm-2">${item.dueDate}</div>
      <div id="action" class="col-sm-3 ">${item.action}</div>
      <div id="note" class="col-sm-3">${item.note === null ? '' : item.note}</div>
      <div id="stat" class="col-sm-1 badge badge-secondary badge-pill">${item.stat}</div>
      <div id="${item.id}" class="col-sm-1 badge badge-danger badge-pill todo-item-delete">Delete</div>
      <div id="${item.id}" class="col-sm-1 badge badge-primary badge-pill todo-item-edit">Edit</div>
    </div>`
}

// 전체 할일 목록을 만드는 함수
// forEach 함수를 사용하여 각 항목을 todoItemTpl 함수로 전달하여 항목을 만들고 이를 output 변수에 추가
function todoListTpl (items) {
  let output = ''
  items.forEach(item => {
    output += todoItemTpl(item)
  })

// 위에서 생성한 항목을 포함하는 전체 할일 목록을 만들어 반환
  return `
  <div id="todo-list">
    <div class="row list-group-item d-flex justify-content-between align-items-center">
      <div class="col-sm-1"></div>
      <div class="col-sm-2">Due</div>
      <div class="col-sm-3">Action</div>
      <div class="col-sm-3">Notes</div>
      <div class="col-sm-1">Status</div>
      <div class="col-sm-1"></div>
      <div class="col-sm-1"></div>
    </div>
    ${output}
  </div>
  <div id="edit-area" class="list-group">
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <span id="input-todo" class="badge badge-success badge-pill">new</span>
    </li>
  </div>`
}

// 할일 항목을 수정하는 화면을 만드는 함수
function editTpl () {
  return `
    <div class="row">&nbsp;</div>
    <div class="row">
      <div class="col-sm-6">
        <div class="row">
          <div class="col-sm-1"></div><div class="col-sm-1">Due: </div><div class="col-sm-6"><input  class="w-100" type="text" id="todo-duedate"></div>
        </div>
        <div class="row">&nbsp;</div>
        <div class="row">
          <div class="col-sm-1"></div><div class="col-sm-1">Action: </div><div class="col-sm-6"><input class="w-100" type="text" id="todo-action"></div>
        </div>
        <div class="row">&nbsp;</div>
        <div class="row">
          <div class="col-sm-1"></div><div class="col-sm-1">Done: </div><div class="col-sm-6"><input type="checkbox" id="todo-stat"></div>
        </div>
        <div class="row">&nbsp;</div>
        <div class="row">
          <div class="col-sm-1"></div>
          <div class="col-sm-1"><button id="todo-save">save</button></div>
          <div class="col-sm-1"><button id="todo-cancel">cancel</button></div>
          <input type="hidden" id="todo-id">
        </div>
      </div>
      <div class="col-sm-6">
        <div class="row">
          <div class="col-sm-1">Note: </div>
          <div class="col-sm-6">
            <textarea id="todo-note" rows="5" cols="50" maxlength="5000" wrap="hard"></textarea>
          </div>
        </div>
      </div>
    </div>`
}


function addTpl () {
  return `<li class="list-group-item d-flex justify-content-between align-items-center">
    <span id="input-todo" class="badge badge-success badge-pill">new</span>
  </li>`
}


function errTpl (err) {
  return `<div class="error">${JSON.stringify(err)}</div>`
}


function navBarTpl (isAuth) {
  let link

  if (isAuth) {
    link = '<a class="nav-link" href="#" id="logout">Logout</a>'
  } else {
    link = '<a class="nav-link" href="#" id="login">Login</a>'
  }

  return `
  <ul class="navbar-nav" id='navbar-list'>
    <li class="nav-item">
      ${link}
    </li>
  </ul>`
}


function navBarScheduleTpl () {
  return `
    <li class="nav-item">
      <button id='todo-schedule'>schedule</button>
    </li>`
}

