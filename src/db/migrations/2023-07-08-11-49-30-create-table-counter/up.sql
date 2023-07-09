CREATE TABLE "counter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" INTEGER NOT NULL
);
-- @@SPLIT
INSERT INTO "counter" (id, value) VALUES (1, 0);
