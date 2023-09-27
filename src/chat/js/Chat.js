import dateFormat from 'dateformat';

export default class Chat {
  constructor() {
    this.formHeader = document.querySelector('.form-header');
    this.nicknameInput = document.querySelector('.nickname-input');
    this.nicknameModal = document.querySelector('.nickname-modal');
    this.usersArea = document.querySelector('.users_area');
    this.messageInput = document.querySelector('.message_input');
    this.messageArea = document.querySelector('.messages-area');
    this.sendMessageForm = document.querySelector('.send_message_form');
    this.ws = new WebSocket('ws://localhost:7070/ws');
    this.clientNick;
    this.usersOnline;
    this._wsMessageHandler();
  }

  // Подтверждение онлайн
  _wsPing() {
    setInterval(() => {
      this.ws.send(JSON.stringify({ ping: this.clientNick }));
    }, 3000);
  }

  // Обработчик сообщений от сервера
  _wsMessageHandler() {
    this.ws.addEventListener('message', (e) => {
      // обработка онлайн пользователей
      if (JSON.parse(e.data).users) {
        this.usersOnline = Array.from(JSON.parse(e.data).users);
        this._showUsersOnline();
      }
      // обработка сообщений
      if (JSON.parse(e.data).data) {
        this._loadMessages(JSON.parse(e.data).data);
        this._scrollDown();
      }
    });
  }

  // Прокрутка вниз
  _scrollDown() {
    this.messageArea.scrollTop = this.messageArea.scrollHeight;
  }

  // Создание и добавление пользователей в окно пользователей
  _createUser(user) {
    const divUser = document.createElement('div');
    divUser.className = 'user';
    if (user !== 'You') {
      divUser.innerHTML = `
        <div class="avatar"></div>
        <div class="nick">${user}</div>
      `;
    } else {
      divUser.innerHTML = `
        <div class="avatar"></div>
        <div class="nick this_user">${user}</div>
      `;
    }

    this.usersArea.append(divUser);
  }

  // Обработка пользователей
  _showUsersOnline() {
    this.usersArea.replaceChildren();

    this.usersOnline.sort()
      .filter((user) => user !== this.clientNick)
      .forEach((filterUser) => this._createUser(filterUser));

    this._createUser('You');
  }

  // Стилизация ошибки ввода ника
  _nickError() {
    this.formHeader.style.color = '#522';
    this.nicknameModal.classList.add('rename');
    setTimeout(() => {
      this.nicknameModal.classList.remove('rename');
    }, 600);
  }

  // Проверка ника и вход в чат
  login() {
    document.querySelector('.nickname-form').addEventListener('submit', (e) => {
      e.preventDefault();

      // не корректный ник
      if (this.usersOnline.some((name) => name === this.nicknameInput.value.trim())) {
        this.formHeader.textContent = 'Этот псевдоним занят! Выберете другой.';
        this._nickError();
      } else if (this.nicknameInput.value.trim() === '') {
        this.formHeader.textContent = 'Вы ничего не ввели.';
        this._nickError();
      // корректный ник
      } else {
        this.formHeader.textContent = 'Введите псевдоним';
        this.clientNick = this.nicknameInput.value.trim();

        this.usersOnline.push(this.clientNick);
        this.formHeader.removeAttribute('style');
        document.querySelector('.enter').classList.remove('active');
        document.querySelector('.chat').classList.add('active');

        this._showUsersOnline();
        this._scrollDown();
        this._wsPing();
      }
    });
  }

  // Создание и добавление сообщений в окно чата
  _loadMessages(data) {
    data.forEach((message) => {
      const divMessage = document.createElement('div');

      let messageClient = '';
      let clientData = '';
      let { nickName } = message;

      if (message.nickName === this.clientNick) {
        messageClient = ' message_client';
        clientData = ' client_data';
        nickName = 'You';
      }

      divMessage.className = `message${messageClient}`;
      divMessage.innerHTML = `
        <div class="message_data${clientData}">
          <div class="message_sender_nick">${nickName}</div>
          <div class="messa_sedend_time">${message.timeStamp}</div>
        </div>
        <div class="message_text">${message.messageText}</div>
      `;
      this.messageArea.append(divMessage);
    });
  }

  // Получение временной метки отправки сообщения
  _getTimeStamp() {
    const now = new Date();
    return dateFormat(now, 'HH:MM  dd.mm.yyyy');
  }

  // отправка сообщения
  sendMessage() {
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.which === 13 && !e.shiftKey) {
        e.preventDefault();

        if (!this.messageInput.value.trim()) {
          return;
        }
        const data = {
          nickName: this.clientNick,
          timeStamp: this._getTimeStamp(),
          messageText: this.messageInput.value,
        };

        this.ws.send(JSON.stringify({ data }));

        this.data = [];
        this.messageInput.value = '';
      }
    });
  }

  activeAll() {
    this.login();
    this.sendMessage();
  }
}
