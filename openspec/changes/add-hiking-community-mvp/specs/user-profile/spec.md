## ADDED Requirements

### Requirement: 自动创建用户资料
系统 SHALL 在账号创建成功时自动建立用户资料，并生成默认昵称。

#### Scenario: 注册时生成默认资料
- **WHEN** 账号（邮箱或 Google）创建成功
- **THEN** 系统为其创建用户资料并以邮箱前缀作为默认昵称

### Requirement: 编辑用户资料
系统 SHALL 允许用户编辑昵称与个人简介并持久化。

#### Scenario: 保存昵称与简介
- **WHEN** 用户编辑昵称和简介并保存
- **THEN** 系统持久化更新该用户资料

#### Scenario: 昵称非法被拒绝
- **WHEN** 用户提交空昵称或超过 30 字符的昵称
- **THEN** 系统拒绝保存并提示

#### Scenario: 简介超长被拒绝
- **WHEN** 用户提交超过 200 字符的简介
- **THEN** 系统拒绝保存并提示

### Requirement: 展示作者信息
系统 SHALL 在动态卡片与详情页展示作者昵称。

#### Scenario: 动态展示作者昵称
- **WHEN** 任意访客查看动态卡片或详情
- **THEN** 系统展示该动态作者的昵称

#### Scenario: 头像缺省占位
- **WHEN** 用户未设置头像
- **THEN** 系统使用占位图展示头像位
