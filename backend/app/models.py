from datetime import datetime, timezone
from . import db
from flask_login import UserMixin
import base64

class User(UserMixin,db.Model):
  __tablename__ = 'users'
  
  id =db.Column(db.Integer,primary_key=True)
  username = db.Column(db.String(100),nullable=False,unique=True)
  user_id = db.Column(db.String(100),unique=True,nullable=True)
  password_hash = db.Column(db.String(128),nullable=False)
  created_at = db.Column(db.DateTime,default=lambda: datetime.now(timezone.utc))
  
  # リレーション: ユーザーが作成したコミュニティ
  communities = db.relationship('Community',backref='creator',lazy='select')
  memberships = db.relationship('Membership',backref='user',lazy='select')
  posts = db.relationship('Post',backref='author',lazy='select')
  
  def __repr__(self):
    return f'<User {self.username}>'


class Community(db.Model):
  __tablename__ = 'communities'
  
  id = db.Column(db.Integer,primary_key=True)
  name = db.Column(db.String(150),nullable=False,unique=True)
  description = db.Column(db.Text,nullable=False)
  icon = db.Column(db.LargeBinary,nullable=True)
  rules = db.Column(db.Text,nullable=False)
  created_at = db.Column(db.DateTime,default=lambda:datetime.now(timezone.utc))
  
    # リレーション: コミュニティを作成したユーザー
  creator_id = db.Column(db.Integer,db.ForeignKey('users.id'),nullable=False)
  
  posts = db.relationship('Post',lazy='select')
  # リレーション: コミュニティに参加しているメンバー
  memberships = db.relationship('Membership',backref='community',lazy='select')

  def to_dict(self,include_members=False,include_posts=False):
    data ={
      'id':self.id,# コミュニティのID
      'name':self.name,# コミュニティの名前
      'description':self.description,# コミュニティの説明
      'icon':base64.b64encode(self.icon).decode('utf-8') if self.icon else None,# コミュニティのアイコン
      'rules':self.rules,# コミュニティのルール
      'created_at':self.created_at.isoformat(),# コミュニティの作成日時
      'creator':{
        'id':self.creator.id,
        'username':self.creator.username
      }
    }
      
    # メンバー情報を含めるかどうか
    if include_members:
      data['members'] = [
        {
          'id': membership.user.id,
          'username': membership.user.username,
          'joined_at': membership.joined_at.isoformat()          
        }for membership in self.memberships
      ]
      # 投稿情報を含めるかどうか
      if include_posts:
        data['posts']=[
          {
            'id':post.id,
            'content':post.content,
            'author':post.author.username,
            'timestamp':post.timestamp.isoformat()
            
          }for post in self.posts
        ]
      
    return data
      
    
    
    
  def __repr__(self):
    return f'<Community {self.name}>'
  
  
class Membership(db.Model):
  __tablename__ = 'memberships'
  
  id = db.Column(db.Integer,primary_key=True)
  user_id = db.Column(db.Integer,db.ForeignKey('users.id'),nullable=False)
  community_id = db.Column(db.Integer,db.ForeignKey('communities.id'),nullable=False)
  joined_at = db.Column(db.DateTime,default=lambda:datetime.now(timezone.utc))
  
  def __repr__(self):
    return f'<Membership User {self.user_id} Community {self.community_id}>'
  
class Post(db.Model):
    __tablename__ = 'posts'
  
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # 外部キー: 投稿者（ユーザー）とコミュニティ
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    community_id = db.Column(db.Integer, db.ForeignKey('communities.id'), nullable=False)
    '''
    author = db.relationship('User', backref='posts')
    community = db.relationship('Community', backref='posts')
    '''
    
    def __repr__(self):
        return f'<Post {self.content[:30]}>'
