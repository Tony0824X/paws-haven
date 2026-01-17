-- Create trigger to notify user when they submit an application
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_application_created ON applications;

-- Create trigger
CREATE TRIGGER on_application_created
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_submission();


-- Ensure the status update trigger is also correct
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

-- Re-create status change trigger
DROP TRIGGER IF EXISTS on_application_status_change ON applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_status_change();
