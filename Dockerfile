# ---- 1段目：フロントをビルドする ----
FROM node:22-alpine AS frontend
WORKDIR /frontend

# package.json だけ先に入れる．依存が変わらない限りこの層が再利用され，npm ci を飛ばせる
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---- 2段目：jar を作る（.java をコンパイルした .class をまとめたもの） ----
FROM eclipse-temurin:21-jdk AS backend
WORKDIR /app
COPY backend/ ./

# フロントの成果物を static/ に置くと，Spring Boot が / でそのまま配信する．
# 配信元が1つになるので，CORS の設定が要らない
COPY --from=frontend /frontend/dist ./src/main/resources/static

RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

# ---- 3段目：動かすだけ ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# 動かすのに javac は要らないので，jar だけ受け取る
COPY --from=backend /app/build/libs/*.jar app.jar

# 無料プランは 512MB．JVM は既定で積極的にメモリを確保するので上限を切る．
# 固定値の -Xmx ではなく割合にして，プランを上げたときに自動で追従させる
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70"

EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
