enum RoleType {
  'system' = 'system',
  'assistant' = 'assistant',
  'user' = 'user',
}

class RoleTypeClass {
  private static readonly [RoleType.system] = new RoleTypeClass(RoleType.system, "system");
  private static readonly [RoleType.assistant] = new RoleTypeClass(RoleType.assistant, "助手");
  private static readonly [RoleType.user] = new RoleTypeClass(RoleType.user, "用户");

  private constructor(public readonly value: RoleType, public readonly description: string) {}

  static values(): {value: RoleType, label: string}[] {
    return [
      {
        value: RoleType.system,
        label: RoleTypeClass[RoleType.system].description
      },
      {
        value: RoleType.assistant,
        label: RoleTypeClass[RoleType.assistant].description
      },
      {
        value: RoleType.user,
        label: RoleTypeClass[RoleType.user].description
      },
    ];
  }

  static enums(): RoleType[] {
    return [
      RoleType.system,
      RoleType.assistant,
      RoleType.user,
    ]
  }
}

export {
  RoleType,
  RoleTypeClass,
}
