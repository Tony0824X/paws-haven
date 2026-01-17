-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('application_update', 'new_pet', 'message', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Re-apply Triggers (just in case they failed before because table was missing)
-- Trigger for application submission
CREATE OR REPLACE FUNCTION notify_application_submission()
RETURNS TRIGGER AS $$
DECLARE
  pet_name TEXT;
BEGIN
  -- Get pet name
  SELECT name INTO pet_name FROM pets WHERE id = NEW.pet_id;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.user_id,
    'application_update',
    '申請提交成功！',
    '您對 ' || COALESCE(pet_name, '毛孩') || ' 的領養申請已成功提交，我們將盡快審核。',
    jsonb_build_object('application_id', NEW.id, 'pet_id', NEW.pet_id, 'pet_name', pet_name)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_created ON applications;
CREATE TRIGGER on_application_created
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_submission();

-- Trigger for status change
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  pet_name TEXT;
BEGIN
  -- Get pet name
  SELECT name INTO pet_name FROM pets WHERE id = NEW.pet_id;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.user_id,
      'application_update',
      CASE NEW.status
        WHEN '已通過' THEN '🎉 領養申請通過！'
        WHEN '未通過' THEN '領養申請結果通知'
        ELSE '領養申請狀態更新'
      END,
      CASE NEW.status
        WHEN '已通過' THEN '恭喜！您對 ' || COALESCE(pet_name, '毛孩') || ' 的領養申請已通過審核！請查看詳情並安排接領時間。'
        WHEN '未通過' THEN '很遺憾，您對 ' || COALESCE(pet_name, '毛孩') || ' 的領養申請未通過審核。感謝您的愛心。'
        ELSE '您對 ' || COALESCE(pet_name, '毛孩') || ' 的領養申請狀態已更新為：' || NEW.status
      END,
      jsonb_build_object('application_id', NEW.id, 'pet_id', NEW.pet_id, 'new_status', NEW.status, 'pet_name', pet_name)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_status_change ON applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_status_change();
