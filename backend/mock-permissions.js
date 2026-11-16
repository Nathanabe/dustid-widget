// Explicit mock grants: adding a friend never grants address access by itself.
const addressPermissions = [
  { buyerId: "contact001", recipientId: "friend101", state: "shared" },
  { buyerId: "contact001", recipientId: "friend102", state: "shared" },
  { buyerId: "contact002", recipientId: "friend201", state: "shared" },
  { buyerId: "contact004", recipientId: "friend401", state: "shared" },
  { buyerId: "contact005", recipientId: "friend501", state: "shared" },
  { buyerId: "contact005", recipientId: "friend502", state: "shared" },
  { buyerId: "contact005", recipientId: "friend503", state: "shared" },
  { buyerId: "contact007", recipientId: "friend701", state: "shared" },
  { buyerId: "contact009", recipientId: "friend901", state: "shared" },
  { buyerId: "contact010", recipientId: "friend1001", state: "shared" },
  { buyerId: "contact010", recipientId: "friend1002", state: "shared" },
  { buyerId: "uk-buyer001", recipientId: "uk-friend001", state: "shared" },
  { buyerId: "uk-buyer001", recipientId: "uk-friend002", state: "revoked" },
  { buyerId: "uk-buyer001", recipientId: "uk-friend003", state: "not_shared" },
  { buyerId: "uk-buyer002", recipientId: "uk-friend001", state: "revoked" },
  { buyerId: "uk-buyer002", recipientId: "uk-friend002", state: "shared" },
];

export function getSharedFriend(buyer, recipientId, permissions = addressPermissions) {
  if (!buyer?.id || typeof recipientId !== "string" || !recipientId) return;

  const permission = permissions.find(
    (entry) => entry.buyerId === buyer.id && entry.recipientId === recipientId
  );
  if (permission?.state !== "shared") return;

  return buyer.friends?.find((friend) => friend.id === recipientId);
}
