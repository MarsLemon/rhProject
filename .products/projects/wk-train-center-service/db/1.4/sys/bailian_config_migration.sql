-- Active: 1780554144730@@47.105.122.150@31101@wk_train_center

INSERT INTO `wk_train_center`.`el_cfg_prop` (`id`, `type`, `provider`, `enabled`, `data`, `remark`)
SELECT REPLACE(UUID(), '-', ''), 'upload', 'aliyun', 1,
  '{"accessKeyId":"","accessKeySecret":"","bucket":"","endpoint":"","arn":"","security":"private","url":"","accelerate":""}',
  'seed row for OSS; configure in admin 存储配置'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `wk_train_center`.`el_cfg_prop` WHERE `type` = 'upload' AND `provider` = 'aliyun'
);

INSERT INTO `wk_train_center`.`el_cfg_prop` (`id`, `type`, `provider`, `enabled`, `data`, `remark`)
SELECT REPLACE(UUID(), '-', ''), 'bailian_kb', 'default', 1,
  '{"workspaceId":"","indexId":"","defaultCategoryId":"","endpoint":"bailian.cn-beijing.aliyuncs.com","roleArn":"","roleSessionName":"BailianSession"}',
  'seed row for Bailian KB; configure in admin 百炼知识库'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `wk_train_center`.`el_cfg_prop` WHERE `type` = 'bailian_kb' AND `provider` = 'default'
);

INSERT INTO `wk_train_center`.`el_cfg_prop` (`id`, `type`, `provider`, `enabled`, `data`, `remark`)
SELECT REPLACE(UUID(), '-', ''), 'voice', 'bailian', 1,
  CONCAT(
    '{"dashscopeApiKey":"',
    COALESCE(
      (SELECT JSON_UNQUOTE(JSON_EXTRACT(`data`, '$.apiKey'))
       FROM `wk_train_center`.`el_cfg_prop`
       WHERE `type` = 'ai' AND `provider` = 'bailian'
       LIMIT 1),
      ''
    ),
    '","dashscopeBaseUrl":"https://dashscope.aliyuncs.com","workspaceId":"","asrModel":"paraformer-realtime-v2","ttsModel":"cosyvoice-v3-flash","defaultVoice":"longanyang"}'
  ),
  'seed row for voice; set dashscopeApiKey in admin 语音能力 (often same sk- as AI接入)'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `wk_train_center`.`el_cfg_prop` WHERE `type` = 'voice' AND `provider` = 'bailian'
);
