-- Paws Haven Seed Data
-- Initial pet data migrated from MOCK_PETS

-- Insert seed pets data
INSERT INTO pets (id, name, type, breed, age, gender, weight, location, is_featured, is_new, traits, images, health_status, description)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567001',
    'Buddy',
    'dog',
    '黃金獵犬',
    '2 歲',
    '公',
    '30kg',
    '中環, 香港',
    true,
    true,
    ARRAY['愛玩', '2個月'],
    ARRAY[
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDj2bKdRu4x6Xq7aQqP2L8fWUOrNdva24IiifcOD4EsDa1hBIdlmgp-r1e8fe4LaLpFzfcDyt32jbswmnaO7wYp7JG-zq-AHG4YDix19FgwuoAHF6gZhdEd__dbe6UDTDV7dfpmCqbEStdKt_2c1yBnTwcURzOEdjcNT8UTNaRdZY8r4ItjVHZ3XDzJD7xA3lx1vWmDMSFq-sm5m8NOW44rJHPaZrv5yKxlo-Xx1fLP80ntowMu6viSQwfhD3XLmRykBWGl2XHGeLI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAw6XiRf7T89RhEV1My4eTrZjQ0gsE8tts2qBPpo0UcV_6nXSj9SfMLX0QILYdL7jm51cILs2s5GxTPrEkjVJhhU9Wk_jOwX9rAU4iNHIkSCYJ-WN9vQH7NeRf2JPtLKZeoSPW55giIWKxvJEqO5hmjKtvU-HxNQ9TQRoQWC5Wt4QdgsobZL_hdTiiakqlxveKfS6nUPf4yEyeYnwF_9WOz-7jpYdIrceQnOOqEClod0QXKMJJSwaWckPLTLLa_du-D-rilcUnM-F8',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByhxxh2wJHak6I9Y81BzE1-CLUKBAFDjjvXAx40FFyLxa9CB7KBroIgXLQTT1VWgd3HE10nQQHGoiKUFYNk7ME_K6WWFd4QYH6cq5R-7r8FCTpNEvTxTczoiF5hqcD0cznb5-D8DswRfs7Mds4P4lJa1ScQjGgXAtU8i4IidNIfsyEVLac3ZPNIbyhaFSC0kgsoMzFcQOW37RczF0RENgjCIRojuZBUrzg3JOCTc1ey67lbxrYVmMvN0dLP-7D-JShqY9wOCgGmUA'
    ],
    ARRAY['已打疫苗', '已結紮', '已植入晶片'],
    ARRAY[
      'Buddy 是一隻內心溫暖如金的狗狗。自從在維多利亞公園附近被發現後，他一直是寄養家庭裡的小明星。他性格極其溫順，是家中有小孩或其他寵物的完美伴侶。',
      '他熱愛早晨的長途散步，而且是個接網球的小高手。雖然在戶外充滿活力，但一回到室內，他就會變身成專業的撒嬌大王。他正在尋找一個溫馨的家，希望能遇到願意陪他玩耍、每天給他摸摸肚子的家人！'
    ]
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567002',
    'Luna',
    'cat',
    '三色貓',
    '1 歲',
    '母',
    '4kg',
    '沙田, 香港',
    false,
    false,
    ARRAY['溫和', '1歲'],
    ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuB6IQ-dv8NHJTUuS0_HqKXJYfJ78kSY8xaT4PLWRDuZ7-kd9v0NFpMKxpCwq7Iat1FzdDBywZdUx8jDg7mxkN2FhvWYowAFiWXelreChzi7iFCcQtTqbYFHbj87N4vFm6Lwsuyrr8tOa6oGp4b-rHdGkjgD5OyIomSUtAPPnZs1rU3wejfr6AoHLlhT3CNQU9vgsmIg5SytfcXjTFscP9QQQrJjXWdWXB4Lx6OOkFQBbDm__K-J_qyDOwnnkk0Rgsj03N75Dg8GEqs'],
    ARRAY['已打疫苗', '已結紮'],
    ARRAY['Luna 是個安靜的小淑女。']
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567003',
    'Snowball',
    'dog',
    '馬爾濟斯',
    '3個月',
    '公',
    '2kg',
    '旺角, 香港',
    false,
    true,
    ARRAY['全新', '男生'],
    ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuC3uAlesJ79OVLDiMT8slqLKSfOv8UmLrRO9gV16q7Ylm84rFfenoh7zl8ekiyxI90f5Ya3ymZlYsE_tpDGyOZxCcK6DgEA-SLuL3leLuCIbo0-QdF6EhnY_GL4WnlbMJNq-0Fucq81DoggwjIeIGWNQjvpkjW5DkNl2QkkHVXcnkx7JeEQDQEFQlx2Xl6bixQA8DUvEvuo9VCLj4a_falgC5vgwO-FlwVHaLnYaQDpfM89IdF78vpkagUCI1nRWW5YxgbkdXZRvJ0'],
    ARRAY['已打疫苗'],
    ARRAY['充滿活力的小狗狗。']
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567004',
    'Ginger',
    'cat',
    '虎斑貓',
    '6個月',
    '母',
    '3kg',
    '銅鑼灣, 香港',
    false,
    true,
    ARRAY['親人', '女生'],
    ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuCoq36ipYS04GMimMLUQ9L3GXvsTXM7RHAIPlfY8qYuvn4nBi1Obzu9_8nFfhpI3yiKHtukiJuQkaN3m5rAgnrnNU1r5F1EHX_0I2TscZXGQiCzV5JtwfX8DehlGDuvFeBAEX06sW38EdEASecfKp11hBtzyg1KPfCXhE6a3JtYy8k5YBYcF7iKJuBulWD_ClpKja7hZed7ZUtgj4YIhnnhNj0uhfjf7uxTBsojxdgLH-HP94U-s1QDANsFldtHLVWCmHxoWzhSVcQ'],
    ARRAY['已打疫苗', '已結紮'],
    ARRAY['活潑好動的虎斑小貓。']
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567005',
    'Oreo',
    'rabbit',
    '垂耳兔',
    '1歲',
    '公',
    '1.5kg',
    '西貢, 香港',
    false,
    false,
    ARRAY['安靜'],
    ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuDewTQtuGQM3C4CyoaLxXtnAsSOcklb8Bodo7eJ3s1BM5FB9U_ghD9FiPuH953sbRR0x9Nz3rQv_SGcYPuFpEbiTjZAs7XXcPuIb-tw0mUPJx82CEd9UU5WMoAX6hnuvvrg-HRV7alAGMce02QJzO5s_b_BicffwTwUN_yKptk_I0cploSgknxxYcGMC_NEE9tRTBbC09A1X09JmBjvCbSuX3pEyZFhUXZp0DHKd60HNdM5HIwGP_yLwATEzXzIZP4OldKoSykoxY0'],
    ARRAY['已檢查健康'],
    ARRAY['喜歡吃紅蘿蔔的安靜兔子。']
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567006',
    'Kiwi',
    'bird',
    '灰鸚鵡',
    '2歲',
    '未知',
    '0.4kg',
    '九龍城, 香港',
    false,
    false,
    ARRAY['聰明'],
    ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuAApO35XRLZInn4kXWXTfAIjU7zz2NPYKYKn87Rq76cQ5rxIwTQAtIKR5gddSVLe4IcpZ6YXKb1GfmSJVyM8w-Ubcn9M8mJUA99ZpgHIzkjFZMcLwh8mPZB6tpOwbuPMcX_eRd5H0az1DMeA_T4dhqyXQ95u8rDGbYY6B2_meuR47-pBSIoa6Zomb9D0ddGJQiFBe8mRljqwDYQrugK-n3OpxnX1FXwWBgHvoQghS0Z88CH79ip8aYlSNkn8Arv8ce0f2aNKZ5OhQA'],
    ARRAY['已打疫苗'],
    ARRAY['會模仿說話的聰明鸚鵡。']
  );

-- Create a default demo user (for testing without auth)
INSERT INTO users (id, email, name, avatar_url, badge)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567000',
  'demo@pawshaven.com',
  'Alex Johnson',
  'https://picsum.photos/200/200?random=10',
  '鑽石級領養人'
);

-- Add some demo favorites for the default user
INSERT INTO favorites (user_id, pet_id)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567001'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567004');

-- Add some demo applications
INSERT INTO applications (user_id, pet_id, status, form_data)
VALUES 
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567000',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567002',
    '審核中',
    '{"name": "Alex Johnson", "phone": "0912-345-678", "email": "demo@pawshaven.com"}'::jsonb
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567000',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567003',
    '已通過',
    '{"name": "Alex Johnson", "phone": "0912-345-678", "email": "demo@pawshaven.com"}'::jsonb
  );
