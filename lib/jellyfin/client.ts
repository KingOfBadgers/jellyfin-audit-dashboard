export class JellyfinClient {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  private headers() {
    return {
      "X-Emby-Token": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  async getMovies(userId: string) {
    const res = await fetch(
      `${this.baseUrl}/Users/${userId}/Items?IncludeItemTypes=Movie&Recursive=true`,
      { headers: this.headers() }
    );

    if (!res.ok) throw new Error("Failed to fetch Jellyfin movies");

    return res.json();
  }
}