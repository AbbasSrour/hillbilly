export const mutationKeyFactory = {
  create: () => ['create'] as const,
  update: () => ['update'] as const,
  delete: () => ['delete'] as const,

  auth: {
    entity: ['auth'] as const,
    login: () => [...mutationKeyFactory.auth.entity, 'login'] as const,
    logout: () => [...mutationKeyFactory.auth.entity, 'logout'] as const,
    verifyEmail: () =>
      [...mutationKeyFactory.auth.entity, 'verifyEmail'] as const,
    sendEmailVerification: () =>
      [...mutationKeyFactory.auth.entity, 'sendEmailVerification'] as const,
  },
  users: {
    entity: ['users'] as const,
    create: () =>
      [
        ...mutationKeyFactory.users.entity,
        ...mutationKeyFactory.create(),
      ] as const,
    update: () =>
      [
        ...mutationKeyFactory.users.entity,
        ...mutationKeyFactory.update(),
      ] as const,
    delete: () =>
      [
        ...mutationKeyFactory.users.entity,
        ...mutationKeyFactory.delete(),
      ] as const,
    sendVerification: () =>
      [...mutationKeyFactory.users.entity, 'sendVerification'] as const,
  },
  roles: {
    entity: ['roles'] as const,
    create: () =>
      [
        ...mutationKeyFactory.roles.entity,
        ...mutationKeyFactory.create(),
      ] as const,
    update: () =>
      [
        ...mutationKeyFactory.roles.entity,
        ...mutationKeyFactory.update(),
      ] as const,
    delete: () =>
      [
        ...mutationKeyFactory.roles.entity,
        ...mutationKeyFactory.delete(),
      ] as const,
  },
  brands: {
    entity: ['brands'] as const,
    create: () =>
      [
        ...mutationKeyFactory.brands.entity,
        ...mutationKeyFactory.create(),
      ] as const,
    update: () =>
      [
        ...mutationKeyFactory.brands.entity,
        ...mutationKeyFactory.update(),
      ] as const,
    delete: () =>
      [
        ...mutationKeyFactory.brands.entity,
        ...mutationKeyFactory.delete(),
      ] as const,
  },
  categories: {
    entity: ['categories'] as const,
    create: () =>
      [
        ...mutationKeyFactory.categories.entity,
        ...mutationKeyFactory.create(),
      ] as const,
    update: () =>
      [
        ...mutationKeyFactory.categories.entity,
        ...mutationKeyFactory.update(),
      ] as const,
    delete: () =>
      [
        ...mutationKeyFactory.categories.entity,
        ...mutationKeyFactory.delete(),
      ] as const,
  },
  vouchers: {
    entity: ['vouchers'] as const,
    create: () => [
      ...mutationKeyFactory.vouchers.entity,
      ...mutationKeyFactory.create(),
    ],
    update: () => [
      ...mutationKeyFactory.vouchers.entity,
      ...mutationKeyFactory.update(),
    ],
    delete: () => [
      ...mutationKeyFactory.vouchers.entity,
      ...mutationKeyFactory.delete(),
    ],
    variations: {
      entity: () =>
        [...mutationKeyFactory.vouchers.entity, 'variations'] as const,
      create: () =>
        [
          ...mutationKeyFactory.vouchers.variations.entity(),
          ...mutationKeyFactory.create(),
        ] as const,
      update: () => [
        ...mutationKeyFactory.vouchers.variations.entity(),
        ...mutationKeyFactory.update(),
      ],
      delete: () => [
        ...mutationKeyFactory.vouchers.variations.entity(),
        ...mutationKeyFactory.delete(),
      ],
    },
  },
  exchangeRates: {
    entity: ['exchangeRates'] as const,
    create: () =>
      [
        ...mutationKeyFactory.exchangeRates.entity,
        ...mutationKeyFactory.create(),
      ] as const,
    update: () =>
      [
        ...mutationKeyFactory.exchangeRates.entity,
        ...mutationKeyFactory.update(),
      ] as const,
    delete: () =>
      [
        ...mutationKeyFactory.exchangeRates.entity,
        ...mutationKeyFactory.delete(),
      ] as const,
  },
  organizations: {
    entity: ['organizations'] as const,
    create: () =>
      [
        ...mutationKeyFactory.organizations.entity,
        ...mutationKeyFactory.create(),
      ] as const,
    update: () =>
      [
        ...mutationKeyFactory.organizations.entity,
        ...mutationKeyFactory.update(),
      ] as const,
    delete: () =>
      [
        ...mutationKeyFactory.organizations.entity,
        ...mutationKeyFactory.delete(),
      ] as const,
    branches: {
      entity: () =>
        [...mutationKeyFactory.organizations.entity, 'branches'] as const,
      create: () =>
        [
          ...mutationKeyFactory.organizations.branches.entity(),
          ...mutationKeyFactory.create(),
        ] as const,
      update: () =>
        [
          ...mutationKeyFactory.organizations.branches.entity(),
          ...mutationKeyFactory.update(),
        ] as const,
      delete: () =>
        [
          ...mutationKeyFactory.organizations.branches.entity(),
          ...mutationKeyFactory.delete(),
        ] as const,
    },
    members: {
      entity: () =>
        [...mutationKeyFactory.organizations.entity, 'members'] as const,
      create: () =>
        [
          ...mutationKeyFactory.organizations.members.entity(),
          ...mutationKeyFactory.create(),
        ] as const,
      update: () =>
        [
          ...mutationKeyFactory.organizations.members.entity(),
          ...mutationKeyFactory.update(),
        ] as const,
      delete: () =>
        [
          ...mutationKeyFactory.organizations.members.entity(),
          ...mutationKeyFactory.delete(),
        ] as const,
    },
  },
  settings: {
    entity: ['settings'] as const,
    config: () => [...mutationKeyFactory.settings.entity, 'config'] as const,
  },
  pricelists: {
    entity: ['pricelists'] as const,
    create: () =>
      [
        ...mutationKeyFactory.pricelists.entity,
        ...mutationKeyFactory.create(),
      ] as const,
    update: () =>
      [
        ...mutationKeyFactory.pricelists.entity,
        ...mutationKeyFactory.update(),
      ] as const,
    delete: () =>
      [
        ...mutationKeyFactory.pricelists.entity,
        ...mutationKeyFactory.delete(),
      ] as const,
  },
  orders: {
    entity: ['orders'] as const,
    create: () =>
      [
        ...mutationKeyFactory.orders.entity,
        ...mutationKeyFactory.create(),
      ] as const,
    update: () =>
      [
        ...mutationKeyFactory.orders.entity,
        ...mutationKeyFactory.update(),
      ] as const,
    delete: () =>
      [
        ...mutationKeyFactory.orders.entity,
        ...mutationKeyFactory.delete(),
      ] as const,
    approve: () => [...mutationKeyFactory.orders.entity, 'approve'],
    reject: () => [...mutationKeyFactory.orders.entity, 'reject'],
    cancel: () => [...mutationKeyFactory.orders.entity, 'cancel'],
    assign: () => [...mutationKeyFactory.orders.entity, 'assign'],
    print: () => [...mutationKeyFactory.orders.entity, 'print'],
    export: () => [...mutationKeyFactory.orders.entity, 'export'],
  },
  upload: {
    entity: ['upload'] as const,
    import: () => [...mutationKeyFactory.upload.entity, 'import'] as const,
  },
  logs: {
    entity: ['logs'] as const,
    redo: () => [...mutationKeyFactory.logs.entity, 'redo'] as const,
  },
} as const;
