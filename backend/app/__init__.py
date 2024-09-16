from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Config
from flask_login import LoginManager
from typing import Optional
from flask_wtf import CSRFProtect
from flask_session import Session

# インスタンスを作成
db = SQLAlchemy()
migrate = Migrate()
csrf = CSRFProtect()


def create_app():
  app = Flask(__name__)
  CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
  app.config.from_object(Config)
  csrf.init_app(app)
  
  Session(app)
  
  # ログインマネージャーの設定
  login_manager = LoginManager()
  login_manager.init_app(app)
  
  # ログインページの設定
  login_manager.login_view = 'login'
    
  db.init_app(app)
  migrate.init_app(app,db)
  
  from app.models import User
  
  # ユーザーローダーの定義
  @login_manager.user_loader
  def load_user(user_id:int) -> Optional[User]:
    print(f"ユーザー{user_id}をロード中")
    return User.query.get(int(user_id))# データベースからユーザーを取得
  
  # ブループリントを登録
  from app.routes import main
  app.register_blueprint(main)
  
  
  return app
