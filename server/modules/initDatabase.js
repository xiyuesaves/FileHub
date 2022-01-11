// 判断是否需要初始化
const init = (db) => {
  let check = [],
    paper = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name= ?");
  check.push(paper.get("user"));
  check.push(paper.get("path"));
  check.push(paper.get("user_path"));
  if (check.includes(undefined)) {
    db.exec(`
      DROP TABLE IF EXISTS "user";
      CREATE TABLE "user" (
        "userId" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "userName" text NOT NULL,
        "password" text NOT NULL,
        "guestbook" text,
        "userLevel" integer(1) NOT NULL DEFAULT 1
      );
      DROP TABLE IF EXISTS "path";
      CREATE TABLE "path" (
        "pathId" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "showPath" text NOT NULL,
        "realPath" text NOT NULL
      );
      DROP TABLE IF EXISTS "user_path";
      CREATE TABLE "user_path" (
        "userId" integer NOT NULL,
        "pathId" integer NOT NULL
      );
    `);
    return true;
  } else {
    return false;
  };
}

module.exports = init;
