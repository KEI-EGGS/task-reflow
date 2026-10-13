-- 認証を入れるまでの開発用ユーザー．
-- schema.sql が起動のたびにテーブルを作り直すため，ここで毎回入れ直す．
-- id を書かないのは，作り直し直後のシーケンスが必ず 1 から始まるため．
-- password_hash はまだハッシュではない．ログイン機能を入れるときに実際の BCrypt 値に差し替える．
INSERT INTO users (username, password_hash)
VALUES ('dev', 'dev');
