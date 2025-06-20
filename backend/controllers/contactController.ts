export const getContacts = (req:Request, res:Response) => {
  const mockContacts = [
    { id: 1, name: "Amy Scholfield", avatar: "/placeholder.svg", date: "17 May" },
    { id: 2, name: "David Ochieng", avatar: "/placeholder.svg", date: "15 May" },
    { id: 3, name: "John Kamau", avatar: "/placeholder.svg", date: "12 May" },
    { id: 4, name: "Mary Wanjiku", avatar: "/placeholder.svg", date: "10 May" },
    { id: 5, name: "Sarah Kimani", avatar: "/placeholder.svg", date: "8 May" },
  ];

  return ({ contacts: mockContacts });
};

