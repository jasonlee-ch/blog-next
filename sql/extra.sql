-- 首先创建生成slug的函数
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.title <> OLD.title THEN
    -- 1. 将非字母数字字符替换为连字符，使用 + 合并连续的非字母数字字符为一个连字符
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    -- 2. 去除首尾的连字符
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    -- 3. 如果生成的 slug 为空（例如标题全是中文），则使用默认前缀加随机数
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
      NEW.slug := 'post-' || FLOOR(RANDOM() * 10000)::TEXT;
    END IF;
    -- 确保 slug 唯一
    WHILE EXISTS(SELECT 1 FROM posts WHERE slug = NEW.slug AND id <> NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || FLOOR(RANDOM() * 1000)::TEXT;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 然后创建触发器
CREATE TRIGGER set_slug
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug();