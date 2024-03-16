import { ConvexError, v } from 'convex/values'
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  query,
} from './_generated/server'
import { rolesTypes } from './schema'

export async function getUser(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_tokenIdentifier', (q) =>
      q.eq('tokenIdentifier', tokenIdentifier)
    )
    .first()

  if (!user) throw new ConvexError('Expected user to exist')

  return user
}

export const createUser = internalMutation({
  args: { tokenIdentifier: v.string(), name: v.string(), avatar: v.string() },
  async handler(ctx, args) {
    await ctx.db.insert('users', {
      tokenIdentifier: args.tokenIdentifier,
      orgIds: [],
      name: args.name,
      avatar: args.avatar,
    })
  },
})

export const updateUser = internalMutation({
  args: { tokenIdentifier: v.string(), name: v.string(), avatar: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', args.tokenIdentifier)
      )
      .first()

    if (!user) throw new ConvexError('Expected user to exist')

    await ctx.db.patch(user._id, {
      name: args.name,
      avatar: args.avatar,
    })
  },
})

export const addOrgIdToUser = internalMutation({
  args: { tokenIdentifier: v.string(), orgId: v.string(), role: rolesTypes },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier)

    await ctx.db.patch(user?._id, {
      orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role }],
    })
  },
})

export const updateRoleInOrgForUser = internalMutation({
  args: { tokenIdentifier: v.string(), orgId: v.string(), role: rolesTypes },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier)

    const org = user.orgIds.find((item) => item.orgId === args.orgId)

    if (!org) throw new ConvexError('Expected org to exist')

    org.role = args.role

    await ctx.db.patch(user?._id, {
      orgIds: user.orgIds,
    })
  },
})

export const getUserProfile = query({
  args: { userId: v.id('users') },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId)

    return {
      name: user?.name,
      avatar: user?.avatar,
    }
  },
})

export const getMe = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) return null

    const user = await getUser(ctx, identity.tokenIdentifier)

    if (!user) return null

    return user
  },
})
