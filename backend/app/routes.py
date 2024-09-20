from flask import Blueprint,request,jsonify,make_response
from .models import Community,db,User,Post,Membership
import json
from werkzeug.security import check_password_hash,generate_password_hash
from flask_login import login_user,current_user,logout_user,login_required
from flask_wtf.csrf import generate_csrf
from . import csrf
from flask import session


# Blueprint を インスタンス化
main = Blueprint('main',__name__)


# ユーザー登録
@main.route('/register',methods=['POST'])
@csrf.exempt # ログインではcsrfを無効にする

def register():
  try:
    data = request.get_json()
    username = data.get('username')
    user_id = data.get('user_id')
    password = data.get('password')
    
    
    # 既存のユーザーを確認
    if User.query.filter_by(user_id=user_id).first() is not None:
      return jsonify({"message":"Username already exists"}),400
    
    # パスワードをハッシュ化して保存
    hashed_password = generate_password_hash(password,method='pbkdf2:sha256')
    
    # 新規ユーザーを作成
    new_user = User(username=username,user_id=user_id,password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message":"Account created successfully"}),201
  
  except Exception as e:
    # エラーをログに出力
    print(f"Error:{e}")
    return jsonify({"message":"Internal server error"}),500

# ログイン
@main.route('/login',methods=['GET','POST'])
@csrf.exempt # ログインではcsrfを無効にする
def login():
  print("ログインのルートにアクセスしました")
  data = request.get_json()
  user_id = data.get('user_id')
  password = data.get('password')
  
  

  print(f"ユーザーID：{user_id}パスワード：{password}")
  user = User.query.filter_by(user_id=user_id).first()
  session['session_user_id'] = user.id
  
  if user and check_password_hash(user.password_hash,password):
    login_user(user,remember=True) # ログイン状態にする
    print(f"session_id:{session.get('_id')}")
    print(f"current_userの中身:{current_user}")
    print(f"ユーザー{user.username}がログインしました")
    
    return jsonify({'message':'Login successful'}),200
  else:
    return jsonify({'message':'Invalid credentials'}),401

# ログインしているか確認
@main.route('/check_login', methods=['GET'])
def check_login():
  print("check_loginにアクセスしました")
  user_id = session.get('session_user_id')
  if user_id :
    print("セッションにユーザーIDが格納されています")
  else:
    print("セッションにユーザー情報は含まれません")
  if current_user.is_authenticated:
      print(f"ユーザーID:{current_user.id}")
      return jsonify({'message': 'User is logged in', 'user': current_user.user_id}), 200
  else:
      print("elseになった際のcurrent_userの内容：",current_user)
      return jsonify({'message': 'User is not logged in'}), 401

@main.route('/get_csrf_token',methods=['GET'])
def get_csrf_token():
  print("get_csrf_tokenにアクセスしました")
  csrf_token = generate_csrf() # csrfトークンを生成
  response = make_response(jsonify({'csrf_token':csrf_token}))
  response.set_cookie('csrf_token',csrf_token)# クッキーにCSRFにトークンをセット
  return response


# コミュニティ作成のエンドポイント
@main.route('/api/create_communities',methods=['POST'])
def create_community():  
  print("リクエストを受け取りました")
  print(request.form)
  print(request.files)
  print('今のユーザー',current_user)
  
  if not current_user.is_authenticated:# ログイン時：True　ログインしていない場合：False
    # ログイン状態じゃない時はここに来るよ
    print(f"現在のユーザー:{current_user},認証状態:{current_user.is_authenticated}")
    return jsonify({'error':'ログインが必要です'}),401
  
  # ログインされているとこっちに来るよ
  name = request.form.get('name')
  description = request.form.get('description')
  rules = request.form.get('rules')
  icon = request.files.get('icon')
  
  # コミュニティ名が既に存在していないかを確認
  existing_community = Community.query.filter_by(name=name).first()
  if existing_community:
    return jsonify({'error':'コミュニティ名が既に存在します。別の名前を選んでください。'})

  print(f"名前:{name},説明:{description},ルール:{rules}")
  if not name or not description  or not rules:
    return jsonify({'error':'記入されていない項目があります'}),400
  
  # ファイルが送信されなかった場合の処理
  if icon:
    icon_data = icon.read()
    print(f"アイコンが正常に送信されました。サイズ：{len(icon_data) if icon_data else '無し'}")

  else:
    icon_data = None
    print("アイコンが送信されていません")
  try:
    # コミュニティを作成し、データベースに保存
    print("コミュニティ情報を追加する")
    new_community = Community(
      name = name,
      description = description,
      rules = rules,
      icon = icon_data,
      creator_id = current_user.id
    )
    db.session.add(new_community)
    db.session.commit()
    print("コミュニティが正常に作成されました")
    return jsonify({'message':'Community created successfully'}), 201
  
  except Exception as e:
    # エラーが発生した場合の処理
    db.session.rollback()
    print(f'エラー発生:{e}')
    return jsonify({'error':str(e)}),500

@main.route('/api/get_communities',methods=['GET'])
def get_communities():
  print("get_communitiesにアクセス")
  communities = Community.query.all() # データベースからすべてのコミュニティを取得
  
  # 各コミュニティのデータをJSON形式に変換
  community_list = [Community.to_dict() for Community in communities]
  return jsonify(community_list),200

'''  
# ログアウトの処理
@main.route('/logout',methods=['POST'])
def logout():
  logout_user()
  return jsonify({'message':'Logout successful'}),200

'''

# コミュニティ情報を取得するエンドポイント
@main.route('/api/community/<int:id>',methods=['GET'])
def get_community_details(id):
  print("get_community_detailsにアクセスしました")
  community = Community.query.get(id)
  # コミュニティが見つかれない場合
  if not community:
    return jsonify({'error','Community not found'}),404

  # コミュニティの詳細データを辞書形式で返す
  return jsonify(community.to_dict(include_members=True,include_posts=True))

# コミュニティの投稿を追加するエンドポイント
@main.route('/api/community/<int:community_id>/posts',methods=['POST'])
def add_post(community_id):
  print("add_postにアクセスしました")
  # リクエストのJSONデータから投稿内容を取得
  data = request.get_json()
  content = data.get('content','')
  
  if not content:
    return jsonify({'error':'Content is required'}),400
  
  # コミュニティを取得
  community = Community.query.get(community_id)
  if not community:
    return jsonify({'error':'Community not found'}),404
  
  # ログイン中のユーザーを取得
  user = current_user
  
  # 新しい投稿を作成
  new_post = Post(content=content,author_id=user.id,community_id=community.id)
  
  # データベースに新しい投稿を追加
  db.session.add(new_post)
  db.session.commit()
  
  # 成功レスポンス
  return jsonify({
    'id':new_post.id,
    'content': new_post.content,
    'author':user.username,
    'timestamp':new_post.timestamp.isoformat()
  }),201

@main.route('/api/community/<int:community_id>/join', methods=['POST'])
@login_required
def join_community(community_id):
    # コミュニティを取得
    community = Community.query.get(community_id)
    if not community:
        return jsonify({'error': 'Community not found'}), 404

    # すでに参加しているか確認
    existing_membership = Membership.query.filter_by(user_id=current_user.id, community_id=community_id).first()
    if existing_membership:
        return jsonify({'error': 'Already a member'}), 400

    # コミュニティに参加
    new_membership = Membership(user_id=current_user.id, community_id=community_id)
    db.session.add(new_membership)
    db.session.commit()

    return jsonify({'message': 'You have successfully joined the community'}), 200
  
  
@main.route('/api/community/<int:community_id>/membership', methods=['GET'])
@login_required
def check_membership(community_id):
    membership = Membership.query.filter_by(user_id=current_user.id, community_id=community_id).first()
    if membership:
        return jsonify({'is_member': True}), 200
    else:
        return jsonify({'is_member': False}), 200
      

@main.route('/api/my_communities', methods=['GET'])
@login_required
def get_my_communities():
    memberships = Membership.query.filter_by(user_id=current_user.id).all()
    communities = [membership.community.to_dict() for membership in memberships]
    return jsonify(communities)
  
  
@main.route('/api/notifications', methods=['GET'])
@login_required
def get_notifications():
    memberships = Membership.query.filter_by(user_id=current_user.id).all()
    community_ids = [membership.community_id for membership in memberships]
    
    # コミュニティに対する新しい投稿を取得
    recent_posts = Post.query.filter(Post.community_id.in_(community_ids)).order_by(Post.timestamp.desc()).limit(10).all()

    # 必要なデータだけを返す
    notifications = [{
        'community_id': post.community_id,
        'community_name': post.community.name,
        'content': post.content,
        'author': post.author.username,
        'timestamp': post.timestamp.isoformat()
    } for post in recent_posts]

    return jsonify(notifications)
  
  
@main.route('/api/search_communities', methods=['GET'])
def search_communities():
    print("search_communitiesにアクセスしました")
    
    search_query = request.args.get('q', '').strip()  # 検索ワードを取得し、余分な空白を削除
    
    try:
        # 検索ワードが空の場合、全てのコミュニティを取得
        if search_query == '':
             communities = Community.query.all()
        else:
            # 部分一致でコミュニティ名を検索
            communities = Community.query.filter(
                Community.name.ilike(f'%{search_query}%')
            ).all()

        # コミュニティのデータをリスト形式で返す
        community_data = [community.to_dict() for community in communities]
        
        return jsonify(community_data), 200
    
    except Exception as e:
        print(f"Error during search: {e}")
        return jsonify({'error': 'An error occurred during the search'}), 500